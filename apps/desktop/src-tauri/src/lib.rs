mod client_state;
mod commands;

pub use client_state::build_client_bootstrap_snapshot;

use commands::get_client_bootstrap_snapshot;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_client_bootstrap_snapshot])
        .run(tauri::generate_context!())
        .expect("error while running ZENTRIX student client");
}
