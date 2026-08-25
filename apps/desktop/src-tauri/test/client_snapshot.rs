use zentrix_student_client::build_client_bootstrap_snapshot;

#[test]
fn build_client_bootstrap_snapshot_describes_the_stage5_client_state() {
    let snapshot = build_client_bootstrap_snapshot();

    assert_eq!(snapshot.auth.surface, "web-login");
    assert_eq!(snapshot.auth.verification_flow, "device-flow/auth-code-flow");
    assert_eq!(snapshot.device.status, "linked");
    assert_eq!(snapshot.course_pack.local_state, "cached");
    assert_eq!(snapshot.runtime.backend, "tauri-rust");
}
