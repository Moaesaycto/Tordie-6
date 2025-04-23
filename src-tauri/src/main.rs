// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Manager};

fn main() {
  tauri::Builder::default()
      .setup(|app| {
          let splash = app.get_webview_window("splashscreen").unwrap();
          let main = app.get_webview_window("main").unwrap();

          std::thread::spawn(move || {
              std::thread::sleep(std::time::Duration::from_secs(2));
              splash.close().unwrap();
              main.show().unwrap();
          });

          Ok(())
      })
      .run(tauri::generate_context!())
      .expect("error while running tauri app");
}
