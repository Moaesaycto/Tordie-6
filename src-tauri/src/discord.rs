use discord_rpc_client::Client as RpcClient;
use lazy_static::lazy_static;
use std::sync::{Arc, Mutex};
use std::{env, thread, time};

lazy_static! {
    pub static ref CURRENT_PROJECT_NAME: Arc<Mutex<String>> =
        Arc::new(Mutex::new("Loading project...".into()));
}

pub fn discord_update_project_name(new_name: String) {
    let mut name = CURRENT_PROJECT_NAME.lock().unwrap();
    *name = new_name.clone();
    println!("[RPC] Project name updated: {new_name}");
}

pub fn start_discord_presence() {
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

    thread::spawn(move || {
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
                    .assets(|ass| ass.large_image("icon").small_image("development-icon"))
                    .timestamps(|t| t.start(epoch_start))
            }) {
                eprintln!("[RPC] Failed to set activity: {e}");
            }

            thread::sleep(time::Duration::from_secs(5));
        }
    });
}
