use crate::client_state::{build_client_bootstrap_snapshot, ClientBootstrapSnapshot};

#[tauri::command]
pub fn get_client_bootstrap_snapshot() -> ClientBootstrapSnapshot {
    build_client_bootstrap_snapshot()
}
