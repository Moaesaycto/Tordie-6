#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use lazy_static::lazy_static;
use discord_rpc_client::Client as RpcClient;
use tauri::Manager;
use std::env;

lazy_static! {
    static ref CURRENT_PROJECT_NAME: Arc<Mutex<String>> =
        Arc::new(Mutex::new("Untitled Project".into()));
}

#[tauri::command(rename_all = "camelCase")]
fn update_project_name(new_name: String) {
    let mut name = CURRENT_PROJECT_NAME.lock().unwrap();
    *name = new_name.clone();
}

fn start_discord_presence() {
    let app_id = match env::var("DISCORD_APP_ID") {
        Ok(id) => id.parse::<u64>().unwrap_or(0),
        Err(_) => {
            println!("[RPC] DISCORD_APP_ID not set. Skipping Rich Presence.");
            return;
        }
    };

    if app_id == 0 {
        println!("[RPC] Invalid DISCORD_APP_ID. Skipping Rich Presence.");
        return;
    }

    let name_clone = CURRENT_PROJECT_NAME.clone();

    std::thread::spawn(move || {
        println!("[RPC] Starting Discord Rich Presence...");

        let mut drpc = RpcClient::new(app_id);
        drpc.start();
        println!("[RPC] RPC client started.");

        let epoch_start = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        loop {
            let name = name_clone.lock().unwrap().clone();

            if let Err(e) = drpc.set_activity(|a| {
                a.state("Development Mode")
                    .details(&name)
                    .assets(|ass| ass.large_image("icon").small_image("small-icon"))
                    .timestamps(|t| t.start(epoch_start))
            }) {
                eprintln!("[RPC] Failed to set activity: {e}");
            }
        
            std::thread::sleep(std::time::Duration::from_secs(2));
        }
    });
}

fn main() {
    // Load .env file if present
    let _ = dotenvy::dotenv();

    println!("[App] Launching Tauri app...");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            update_project_name
        ])
        .setup(|app| {
            println!("[App] Running setup...");
            start_discord_presence();

            let splash = app.get_webview_window("splashscreen").unwrap();
            let main = app.get_webview_window("main").unwrap();

            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(2));
                let _ = splash.close();
                let _ = main.show();
                println!("[App] Splash closed, main window shown.");
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("[App] Failed to run Tauri app.");
}
