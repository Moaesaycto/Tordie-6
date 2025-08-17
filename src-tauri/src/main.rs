#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenvy::dotenv;
use tauri::Manager;

mod discord;
use discord::{discord_update_project_name, start_discord_presence};

mod td6;

#[tauri::command]
fn update_project_name(new_name: String) {
    discord_update_project_name(new_name);
}

#[tauri::command]
fn test_command() {
    println!("[Tauri] Connection to frontend secured");
}

fn main() {
    let _ = dotenv();
    println!("[App] Launching Tauri app...");

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![update_project_name, test_command,td6::td6_save, td6::td6_load])
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
