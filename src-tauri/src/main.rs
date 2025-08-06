#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use dotenvy::dotenv;

mod discord;
use discord::{start_discord_presence, update_project_name};

#[tauri::command(rename_all = "camelCase")]
fn update_project_name_tauri(new_name: String) {
    update_project_name(new_name);
}

fn main() {
    let _ = dotenv();
    println!("[App] Launching Tauri app...");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            update_project_name_tauri
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
