-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'VIEWER' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login TIMESTAMPTZ
);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'OFFLINE' NOT NULL,
    firmware_version VARCHAR(50) DEFAULT '0.0.0' NOT NULL,
    active_bank CHAR(1) DEFAULT 'A' NOT NULL,
    bank_a_firmware VARCHAR(50) DEFAULT '0.0.0',
    bank_b_firmware VARCHAR(50),
    health INTEGER DEFAULT 0,
    led VARCHAR(20) DEFAULT 'OFF',
    oled_line0 VARCHAR(100),
    oled_line1 VARCHAR(100),
    oled_line2 VARCHAR(100),
    oled_line3 VARCHAR(100),
    pir_motion BOOLEAN DEFAULT FALSE,
    radar_distance DECIMAL(6,2) DEFAULT 0.0,
    safe_mode BOOLEAN DEFAULT FALSE,
    watchdog_healthy BOOLEAN DEFAULT TRUE,
    heartbeat BOOLEAN DEFAULT FALSE,
    uptime BIGINT DEFAULT 0,
    last_seen TIMESTAMPTZ,
    update_state VARCHAR(50) DEFAULT 'IDLE' NOT NULL,
    rollback_count INTEGER DEFAULT 0,
    target_hardware VARCHAR(100) DEFAULT 'NXP-FRDM-MCXN236',
    is_simulated BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Firmware Releases
CREATE TABLE IF NOT EXISTS firmware_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    sha256 VARCHAR(64) NOT NULL,
    signature_status VARCHAR(50) DEFAULT 'SIGNED' NOT NULL,
    target_hardware VARCHAR(100) NOT NULL,
    minimum_bootloader VARCHAR(50),
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
    description TEXT,
    health_gate_passes BOOLEAN DEFAULT TRUE,
    is_breaking_demo BOOLEAN DEFAULT FALSE,
    deployment_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Deployments
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firmware_release_id UUID NOT NULL REFERENCES firmware_releases(id),
    device_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    current_state VARCHAR(50) DEFAULT 'IDLE' NOT NULL,
    rollback_triggered BOOLEAN DEFAULT FALSE,
    failure_reason TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- Device Events
CREATE TABLE IF NOT EXISTS device_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'INFO' NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Security Events
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    firmware_version VARCHAR(50),
    resolved BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
