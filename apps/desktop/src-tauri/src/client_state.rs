use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ClientBootstrapSnapshot {
    pub auth: ClientAuthSnapshot,
    pub device: ClientDeviceSnapshot,
    pub course_pack: ClientCoursePackSnapshot,
    pub runtime: ClientRuntimeSnapshot,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ClientAuthSnapshot {
    pub surface: String,
    pub verification_flow: String,
    pub status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ClientDeviceSnapshot {
    pub status: String,
    pub mode: String,
    pub binding: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ClientCoursePackSnapshot {
    pub local_state: String,
    pub manifest_state: String,
    pub offline_state: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ClientRuntimeSnapshot {
    pub backend: String,
    pub file_system: String,
    pub execution: String,
}

pub fn build_client_bootstrap_snapshot() -> ClientBootstrapSnapshot {
    ClientBootstrapSnapshot {
        auth: ClientAuthSnapshot {
            surface: "web-login".to_string(),
            verification_flow: "device-flow/auth-code-flow".to_string(),
            status: "linked".to_string(),
        },
        device: ClientDeviceSnapshot {
            status: "linked".to_string(),
            mode: "desktop".to_string(),
            binding: "confirmed".to_string(),
        },
        course_pack: ClientCoursePackSnapshot {
            local_state: "cached".to_string(),
            manifest_state: "fresh".to_string(),
            offline_state: "available".to_string(),
        },
        runtime: ClientRuntimeSnapshot {
            backend: "tauri-rust".to_string(),
            file_system: "enabled".to_string(),
            execution: "ready".to_string(),
        },
    }
}
