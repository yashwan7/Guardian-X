-- Seed firmware releases
INSERT INTO firmware_releases (id, name, version, type, sha256, signature_status, target_hardware, minimum_bootloader, status, description, health_gate_passes, is_breaking_demo, deployment_count)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Guardian Stable',
    '1.0.0',
    'STABLE',
    'a3f8d2c1e4b7f9a2d5c8e1b4f7a2d5c8e1b4f7a2d5c8e1b4f7a2d5c8e1b4f701',
    'SIGNED',
    'NXP-FRDM-MCXN236',
    '1.0.0',
    'APPROVED',
    'Normal healthy firmware. Boots successfully, initializes all peripherals, heartbeat active, LED healthy state, OLED shows healthy, sensors operate normally. Health gate passes and firmware becomes CONFIRMED.',
    TRUE,
    FALSE,
    0
),
(
    '00000000-0000-0000-0000-000000000002',
    'Guardian Fault Injection',
    '2.0.0',
    'BROKEN',
    'b7e3a9c2f5d8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3b6d9a2c5e8b1d4f7a0c302',
    'SIGNED',
    'NXP-FRDM-MCXN236',
    '1.0.0',
    'APPROVED',
    'Intentionally broken demo firmware. Passes cryptographic validation but health check intentionally fails. Demonstrates that signature acceptance does NOT guarantee operational health. Triggers rollback and Safe Mode.',
    FALSE,
    TRUE,
    0
)
ON CONFLICT (id) DO NOTHING;

-- Seed initial simulated device (NXP-001)
INSERT INTO devices (id, device_id, name, status, firmware_version, active_bank, bank_a_firmware, bank_b_firmware, health, led, oled_line0, oled_line1, oled_line2, oled_line3, pir_motion, radar_distance, safe_mode, watchdog_healthy, heartbeat, uptime, update_state, rollback_count, target_hardware, is_simulated)
VALUES
(
    '00000000-0000-0000-0001-000000000001',
    'NXP-001',
    'Guardian Demo Unit',
    'ONLINE',
    '1.0.0',
    'A',
    '1.0.0',
    NULL,
    98,
    'GREEN',
    'SECURE OTA',
    'FW: 1.0.0',
    'BANK: A',
    'HEALTHY',
    FALSE,
    0.0,
    FALSE,
    TRUE,
    TRUE,
    0,
    'IDLE',
    0,
    'NXP-FRDM-MCXN236',
    TRUE
)
ON CONFLICT (device_id) DO NOTHING;

-- Seed a welcome event
INSERT INTO device_events (device_id, event_type, severity, message)
VALUES ('NXP-001', 'DEVICE_ONLINE', 'INFO', 'Guardian Demo Unit (NXP-001) initialized and online. Firmware v1.0.0 confirmed on Bank A.');
