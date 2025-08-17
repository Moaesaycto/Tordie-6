//! TD6 file I/O
//!
//! Goals:
//! - Keep Rust “dumb”: it doesn’t know your schema; it just (de)compresses JSON.
//! - Streamed writes with an atomic replace (temp file + rename).
//! - Cross-platform overwrite semantics (Unix: rename overwrites; Windows: remove then rename).
//!
//! File layout (little-endian):
//!   [0..4]   : b"TD6\0"                // magic
//!   [4]      : u8 codec_id (=1 zstd)   // allows future codecs
//!   [5..9]   : u32 schema_major        // mirrors major of SaveProps.version
//!   [9..17]  : u64 uncompressed_len    // size of JSON before compression
//!   [17..]   : zstd-compressed JSON    // serde_json::Value payload
//!
//! Loading validates the header and returns the original JSON `Value`.

use anyhow::{Context, Result};
use serde_json::Value;
use std::{
  fs,
  fs::File,
  io::{BufReader, BufWriter, Read, Write},
  path::{Path, PathBuf},
};

// ---- Header constants -------------------------------------------------------

/// Magic bytes that identify a TD6 file.
const MAGIC: &[u8; 4] = b"TD6\0";

/// Codec identifier: 1 = Zstandard (zstd).
const CODEC_ZSTD: u8 = 1;

// ---- Atomic replace helper --------------------------------------------------
/// Write to `final_path` atomically:
/// 1) Write the full payload to a sibling temp file.
/// 2) Flush and close it.
/// 3) Replace the destination with a single rename.
///    - On Unix, rename overwrites.
///    - On Windows, pre-remove the destination to simulate overwrite.
///
/// This prevents partial/corrupt files if the app crashes mid-write.
fn atomic_replace<F>(final_path: &Path, write_payload: F) -> Result<()>
where
  F: FnOnce(&mut BufWriter<File>) -> Result<()>,
{
  // Temp path: "<name>.<ext>.__tmp"
  let tmp = final_path.with_extension(format!(
    "{}.__tmp",
    final_path
      .extension()
      .and_then(|s| s.to_str())
      .unwrap_or("tmp")
  ));

  // Scope to ensure file handle is dropped before rename.
  {
    let file = File::create(&tmp)
      .with_context(|| format!("create tmp {}", tmp.display()))?;
    let mut w = BufWriter::new(file);
    write_payload(&mut w)?;
    // Ensure all bytes hit the OS buffers.
    w.flush()
      .with_context(|| format!("flush tmp {}", tmp.display()))?;
  }

  // Windows doesn't allow rename-overwrite; emulate "replace".
  #[cfg(target_family = "windows")]
  if final_path.exists() {
    // Best-effort remove; if locked, the following rename will error.
    fs::remove_file(final_path).with_context(|| {
      format!("remove existing dest before rename {}", final_path.display())
    })?;
  }

  fs::rename(&tmp, final_path).with_context(|| {
    format!("rename {} -> {}", tmp.display(), final_path.display())
  })?;

  Ok(())
}

// ---- Save command -----------------------------------------------------------

/// Save a TD6 file.
/// - `path`: destination file path (should end with `.td6`, but we don't enforce).
/// - `schema_major`: the major of your front-end schema/version (used only for header).
/// - `doc`: arbitrary JSON (your `SaveProps`); Rust does not inspect it.
#[tauri::command]
pub fn td6_save(path: String, schema_major: u32, doc: Value) -> Result<(), String> {
  let final_path = PathBuf::from(path);

  // Serialize the JSON in the frontend's current shape.
  let uncompressed =
    serde_json::to_vec(&doc).map_err(to_s)?;
  let un_len = uncompressed.len() as u64;

  // Write header + zstd-compressed payload with atomic replace.
  atomic_replace(&final_path, |w| {
    // Header
    w.write_all(MAGIC)?;                                   // magic
    w.write_all(&[CODEC_ZSTD])?;                           // codec id
    w.write_all(&schema_major.to_le_bytes())?;             // schema major
    w.write_all(&un_len.to_le_bytes())?;                   // uncompressed JSON length

    // Body (zstd-compressed JSON)
    let mut enc = zstd::stream::write::Encoder::new(w, 9)?; // level 9: good ratio, still quick
    enc.write_all(&uncompressed)?;
    let _underlying = enc.finish()?; // returns &mut BufWriter<File> (already borrowed), ignore

    Ok(())
  })
  .map_err(to_s)
}

// ---- Load command -----------------------------------------------------------

/// Load a TD6 file and return its JSON payload (exact shape the frontend saved).
#[tauri::command]
pub fn td6_load(path: String) -> Result<Value, String> {
  let p = PathBuf::from(path);

  // Wrap in buffered reader for fewer syscalls.
  let mut r = BufReader::new(
    File::open(&p).map_err(to_s)?
  );

  // Read + validate header.
  let mut magic = [0u8; 4];
  r.read_exact(&mut magic).map_err(to_s)?;
  if &magic != MAGIC {
    return Err("Not a TD6 file (bad magic)".into());
  }

  let mut codec = [0u8; 1];
  r.read_exact(&mut codec).map_err(to_s)?;
  if codec[0] != CODEC_ZSTD {
    return Err("Unsupported codec (expected zstd)".into());
  }

  let mut schema = [0u8; 4];
  r.read_exact(&mut schema).map_err(to_s)?;
  let _schema_major = u32::from_le_bytes(schema);
  // You may choose to surface `_schema_major` to the UI if you want to gate migrations.

  let mut len = [0u8; 8];
  r.read_exact(&mut len).map_err(to_s)?;
  let _un_len = u64::from_le_bytes(len);
  // `_un_len` is informational; we don't pre-allocate strictly to that size.

  // Decompress entire payload into memory, then parse JSON.
  // For huge files, you can stream-parse later with serde_json::Deserializer.
  let mut dec = zstd::stream::read::Decoder::new(r).map_err(to_s)?;
  let mut buf = Vec::new();
  dec.read_to_end(&mut buf).map_err(to_s)?;

  serde_json::from_slice(&buf).map_err(to_s)
}

// ---- Error mapping helper ---------------------------------------------------

/// Convert any error to a `String` for Tauri IPC surface.
fn to_s<E: std::fmt::Display>(e: E) -> String {
  e.to_string()
}

// -----------------------------------------------------------------------------
// Register in src-tauri/src/main.rs:
//   mod td6;
//   tauri::Builder::default()
//     .invoke_handler(tauri::generate_handler![td6::td6_save, td6::td6_load])
//     .run(tauri::generate_context!())
//     .expect("error while running tauri");
//
// Cargo.toml (add):
//   anyhow = "1"
//   serde_json = "1"
//   zstd = "0.13"
// -----------------------------------------------------------------------------
