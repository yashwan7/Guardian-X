import os

base_dir = "/Users/yashwanth/Documents/GARDIAN X OTA/backend/"

files = {
    "pom.xml": """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>com.guardianota</groupId>
    <artifactId>guardian-backend</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>guardian-backend</name>
    <description>Secure OTA Guardian - Firmware Lifecycle Backend</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!-- WebSocket / STOMP -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>
        <!-- JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <!-- Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <!-- Actuator -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <!-- PostgreSQL -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <!-- Flyway -->
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <!-- JJWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>""",
    "src/main/resources/application.yml": """spring:
  application:
    name: guardian-backend
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/guardian}
    username: ${DATABASE_USERNAME:guardian}
    password: ${DATABASE_PASSWORD:guardian_secret}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration

server:
  port: 8080
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000}

guardian:
  jwt:
    secret: ${SUPABASE_JWT_SECRET:fallback-secret-for-dev-only-do-not-use-in-production}
  simulator:
    enabled: true
    device-id: NXP-001
    telemetry-interval-ms: 2000

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always

logging:
  level:
    com.guardianota: DEBUG
    org.springframework.web.socket: INFO
    org.springframework.security: WARN""",
    "src/main/resources/db/migration/V1__init_schema.sql": """-- Users table
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
);""",
    "src/main/resources/db/migration/V2__seed_data.sql": """-- Seed firmware releases
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
VALUES ('NXP-001', 'DEVICE_ONLINE', 'INFO', 'Guardian Demo Unit (NXP-001) initialized and online. Firmware v1.0.0 confirmed on Bank A.');""",
    "src/main/java/com/guardianota/GuardianBackendApplication.java": """package com.guardianota;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GuardianBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(GuardianBackendApplication.class, args);
    }
}""",
    "src/main/java/com/guardianota/entity/Device.java": """package com.guardianota.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "devices")
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "device_id", unique = true, nullable = false)
    private String deviceId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private String status = "OFFLINE";

    @Column(name = "firmware_version", nullable = false)
    @Builder.Default
    private String firmwareVersion = "0.0.0";

    @Column(name = "active_bank", nullable = false, length = 1)
    @Builder.Default
    private String activeBank = "A";

    @Column(name = "bank_a_firmware")
    @Builder.Default
    private String bankAFirmware = "0.0.0";

    @Column(name = "bank_b_firmware")
    private String bankBFirmware;

    @Builder.Default
    private Integer health = 0;

    @Builder.Default
    private String led = "OFF";

    @Column(name = "oled_line0")
    private String oledLine0;
    @Column(name = "oled_line1")
    private String oledLine1;
    @Column(name = "oled_line2")
    private String oledLine2;
    @Column(name = "oled_line3")
    private String oledLine3;

    @Column(name = "pir_motion")
    @Builder.Default
    private Boolean pirMotion = false;

    @Column(name = "radar_distance")
    @Builder.Default
    private Double radarDistance = 0.0;

    @Column(name = "safe_mode")
    @Builder.Default
    private Boolean safeMode = false;

    @Column(name = "watchdog_healthy")
    @Builder.Default
    private Boolean watchdogHealthy = true;

    @Builder.Default
    private Boolean heartbeat = false;

    @Builder.Default
    private Long uptime = 0L;

    @Column(name = "last_seen")
    private Instant lastSeen;

    @Column(name = "update_state", nullable = false)
    @Builder.Default
    private String updateState = "IDLE";

    @Column(name = "rollback_count")
    @Builder.Default
    private Integer rollbackCount = 0;

    @Column(name = "target_hardware")
    @Builder.Default
    private String targetHardware = "NXP-FRDM-MCXN236";

    @Column(name = "is_simulated", nullable = false)
    @Builder.Default
    private Boolean isSimulated = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}""",
    "src/main/java/com/guardianota/entity/FirmwareRelease.java": """package com.guardianota.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "firmware_releases")
public class FirmwareRelease {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String version;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, length = 64)
    private String sha256;

    @Column(name = "signature_status", nullable = false)
    @Builder.Default
    private String signatureStatus = "SIGNED";

    @Column(name = "target_hardware", nullable = false)
    private String targetHardware;

    @Column(name = "minimum_bootloader")
    private String minimumBootloader;

    @Column(nullable = false)
    @Builder.Default
    private String status = "DRAFT";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "health_gate_passes")
    @Builder.Default
    private Boolean healthGatePasses = true;

    @Column(name = "is_breaking_demo")
    @Builder.Default
    private Boolean isBreakingDemo = false;

    @Column(name = "deployment_count")
    @Builder.Default
    private Integer deploymentCount = 0;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = updatedAt = Instant.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = Instant.now(); }
}""",
    "src/main/java/com/guardianota/entity/Deployment.java": """package com.guardianota.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "deployments")
public class Deployment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "firmware_release_id", nullable = false)
    private FirmwareRelease firmwareRelease;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "current_state", nullable = false)
    @Builder.Default
    private String currentState = "IDLE";

    @Column(name = "rollback_triggered")
    @Builder.Default
    private Boolean rollbackTriggered = false;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "started_at", updatable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @PrePersist
    protected void onCreate() { startedAt = Instant.now(); }
}""",
    "src/main/java/com/guardianota/entity/DeviceEvent.java": """package com.guardianota.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "device_events")
public class DeviceEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(nullable = false)
    @Builder.Default
    private String severity = "INFO";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Instant timestamp;

    @PrePersist
    protected void onCreate() { if (timestamp == null) timestamp = Instant.now(); }
}""",
    "src/main/java/com/guardianota/entity/SecurityEvent.java": """package com.guardianota.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "security_events")
public class SecurityEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "firmware_version")
    private String firmwareVersion;

    @Builder.Default
    private Boolean resolved = false;

    private Instant timestamp;

    @PrePersist
    protected void onCreate() { if (timestamp == null) timestamp = Instant.now(); }
}""",
    "src/main/java/com/guardianota/repository/DeviceRepository.java": """package com.guardianota.repository;

import com.guardianota.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {
    Optional<Device> findByDeviceId(String deviceId);
    long countByStatus(String status);
}""",
    "src/main/java/com/guardianota/repository/FirmwareReleaseRepository.java": """package com.guardianota.repository;

import com.guardianota.entity.FirmwareRelease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FirmwareReleaseRepository extends JpaRepository<FirmwareRelease, UUID> {
    Optional<FirmwareRelease> findByVersion(String version);
    List<FirmwareRelease> findAllByOrderByCreatedAtDesc();
}""",
    "src/main/java/com/guardianota/repository/DeploymentRepository.java": """package com.guardianota.repository;

import com.guardianota.entity.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, UUID> {
    List<Deployment> findAllByOrderByStartedAtDesc();
    List<Deployment> findByDeviceIdOrderByStartedAtDesc(String deviceId);
}""",
    "src/main/java/com/guardianota/repository/DeviceEventRepository.java": """package com.guardianota.repository;

import com.guardianota.entity.DeviceEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DeviceEventRepository extends JpaRepository<DeviceEvent, UUID> {
    List<DeviceEvent> findTop50ByOrderByTimestampDesc();
    List<DeviceEvent> findByDeviceIdOrderByTimestampDesc(String deviceId);
}""",
    "src/main/java/com/guardianota/repository/SecurityEventRepository.java": """package com.guardianota.repository;

import com.guardianota.entity.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, UUID> {
    List<SecurityEvent> findAllByOrderByTimestampDesc();
    long countByResolved(Boolean resolved);
}""",
    "src/main/java/com/guardianota/dto/DeviceDTO.java": """package com.guardianota.dto;

import lombok.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDTO {
    private UUID id;
    private String deviceId;
    private String name;
    private String status;
    private String firmwareVersion;
    private String activeBank;
    private String inactiveBank;
    private String bankAFirmware;
    private String bankBFirmware;
    private Integer health;
    private String led;
    private List<String> oledLines;
    private Boolean pirMotion;
    private Double radarDistance;
    private Boolean safeMode;
    private Boolean watchdogHealthy;
    private Boolean heartbeat;
    private Long uptime;
    private Instant lastSeen;
    private String updateState;
    private Integer rollbackCount;
    private String targetHardware;
    private Boolean isSimulated;
}""",
    "src/main/java/com/guardianota/dto/FirmwareReleaseDTO.java": """package com.guardianota.dto;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirmwareReleaseDTO {
    private UUID id;
    private String name;
    private String version;
    private String type;
    private String sha256;
    private String signatureStatus;
    private String targetHardware;
    private String minimumBootloader;
    private String status;
    private String description;
    private Boolean healthGatePasses;
    private Boolean isBreakingDemo;
    private Integer deploymentCount;
    private Instant createdAt;
}""",
    "src/main/java/com/guardianota/dto/FleetSummaryDTO.java": """package com.guardianota.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FleetSummaryDTO {
    private long totalDevices;
    private long healthy;
    private long updating;
    private long failed;
    private long safeMode;
    private long offline;
    private long recovering;
    private String activeFirmware;
    private long rollbackCount;
    private long securityEvents;
}""",
    "src/main/java/com/guardianota/dto/DeploymentRequestDTO.java": """package com.guardianota.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentRequestDTO {
    @NotNull
    private UUID firmwareReleaseId;

    @NotBlank
    private String deviceId;
}""",
    "src/main/java/com/guardianota/dto/DeviceEventDTO.java": """package com.guardianota.dto;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceEventDTO {
    private UUID id;
    private String deviceId;
    private String eventType;
    private String severity;
    private String message;
    private Instant timestamp;
}""",
    "src/main/java/com/guardianota/security/JwtAuthenticationFilter.java": """package com.guardianota.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Base64;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${guardian.jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            // Build secret key from the Supabase JWT secret
            byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            SecretKey key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(keyBytes);
            
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String subject = claims.getSubject();
            String role = claims.get("role", String.class);
            if (role == null) role = "VIEWER";

            List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                    new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())
            );

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(subject, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (JwtException e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            // Don't set auth — request will fail if endpoint requires auth
        } catch (Exception e) {
            log.warn("Unexpected error in JWT filter: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}""",
    "src/main/java/com/guardianota/config/SecurityConfig.java": """package com.guardianota.config;

import com.guardianota.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Value("${server.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/health", "/actuator/**", "/ws/**", "/ws-sockjs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(","), "http://localhost:*"));
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}""",
    "src/main/java/com/guardianota/config/WebSocketConfig.java": """package com.guardianota.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}""",
    "src/main/java/com/guardianota/device/DeviceAdapter.java": """package com.guardianota.device;

import com.guardianota.dto.DeviceDTO;

public interface DeviceAdapter {
    /**
     * Connect to the device.
     * For simulated: initializes in-memory state.
     * For real NXP: establishes MQTT connection.
     */
    void connect(String deviceId);

    /**
     * Disconnect from device.
     */
    void disconnect(String deviceId);

    /**
     * Get current device status.
     */
    DeviceDTO getStatus(String deviceId);

    /**
     * Send firmware binary to device.
     * For simulated: stores release ID for state machine.
     * For real NXP: transfers firmware via MQTT/XMODEM/etc.
     */
    void sendFirmware(String deviceId, String firmwareReleaseId);

    /**
     * Start OTA update process.
     * @param isBreakingDemo If true, the update will simulate a health gate failure and rollback.
     */
    void startUpdate(String deviceId, String firmwareReleaseId, String targetVersion, boolean healthGatePasses);

    /**
     * Request device recovery from SAFE_MODE.
     */
    void requestRecovery(String deviceId);

    /**
     * Check if device is connected.
     */
    boolean isConnected(String deviceId);
}""",
    "src/main/java/com/guardianota/device/SimulatedDeviceAdapter.java": """package com.guardianota.device;

import com.guardianota.dto.DeviceDTO;
import com.guardianota.dto.DeviceEventDTO;
import com.guardianota.entity.Device;
import com.guardianota.entity.DeviceEvent;
import com.guardianota.entity.SecurityEvent;
import com.guardianota.repository.DeviceEventRepository;
import com.guardianota.repository.DeviceRepository;
import com.guardianota.repository.SecurityEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class SimulatedDeviceAdapter implements DeviceAdapter {

    private final SimpMessagingTemplate messagingTemplate;
    private final DeviceRepository deviceRepository;
    private final DeviceEventRepository eventRepository;
    private final SecurityEventRepository securityEventRepository;

    // In-memory device states for simulation
    private final Map<String, InMemoryDeviceState> deviceStates = new ConcurrentHashMap<>();
    private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(4);

    private static class InMemoryDeviceState {
        String deviceId;
        String firmwareVersion = "1.0.0";
        String activeBank = "A";
        String bankAFirmware = "1.0.0";
        String bankBFirmware = null;
        int health = 98;
        String led = "GREEN";
        String oledLine0 = "SECURE OTA";
        String oledLine1 = "FW: 1.0.0";
        String oledLine2 = "BANK: A";
        String oledLine3 = "HEALTHY";
        boolean pirMotion = false;
        double radarDistance = 0.0;
        boolean safeMode = false;
        boolean watchdogHealthy = true;
        boolean heartbeat = true;
        long uptime = 0;
        String updateState = "IDLE";
        String status = "ONLINE";
        int rollbackCount = 0;
        volatile boolean updateInProgress = false;

        InMemoryDeviceState(String deviceId) {
            this.deviceId = deviceId;
        }
    }

    @PostConstruct
    public void init() {
        // Initialize state from DB
        List<Device> devices = deviceRepository.findAll();
        for (Device d : devices) {
            InMemoryDeviceState state = new InMemoryDeviceState(d.getDeviceId());
            state.firmwareVersion = d.getFirmwareVersion();
            state.activeBank = d.getActiveBank();
            state.bankAFirmware = d.getBankAFirmware();
            state.bankBFirmware = d.getBankBFirmware();
            state.health = d.getHealth() != null ? d.getHealth() : 98;
            state.led = d.getLed() != null ? d.getLed() : "GREEN";
            state.safeMode = d.getSafeMode() != null && d.getSafeMode();
            state.watchdogHealthy = d.getWatchdogHealthy() == null || d.getWatchdogHealthy();
            state.heartbeat = d.getHeartbeat() != null && d.getHeartbeat();
            state.uptime = d.getUptime() != null ? d.getUptime() : 0;
            state.updateState = d.getUpdateState() != null ? d.getUpdateState() : "IDLE";
            state.status = d.getStatus() != null ? d.getStatus() : "ONLINE";
            state.rollbackCount = d.getRollbackCount() != null ? d.getRollbackCount() : 0;
            deviceStates.put(d.getDeviceId(), state);
            log.info("[SIMULATOR] Initialized device {} from DB", d.getDeviceId());
        }
    }

    @Override
    public void connect(String deviceId) {
        log.info("[SIMULATOR] Connecting to device {}", deviceId);
        if (!deviceStates.containsKey(deviceId)) {
            deviceStates.put(deviceId, new InMemoryDeviceState(deviceId));
        }
        deviceStates.get(deviceId).status = "ONLINE";
        deviceStates.get(deviceId).heartbeat = true;
        saveAndBroadcast(deviceId);
    }

    @Override
    public void disconnect(String deviceId) {
        log.info("[SIMULATOR] Disconnecting device {}", deviceId);
        InMemoryDeviceState state = deviceStates.get(deviceId);
        if (state != null) {
            state.status = "OFFLINE";
            state.heartbeat = false;
            saveAndBroadcast(deviceId);
        }
    }

    @Override
    public DeviceDTO getStatus(String deviceId) {
        InMemoryDeviceState state = deviceStates.get(deviceId);
        if (state == null) return null;
        return toDTO(state);
    }

    @Override
    public void sendFirmware(String deviceId, String firmwareReleaseId) {
        log.info("[SIMULATOR] Sending firmware {} to device {}", firmwareReleaseId, deviceId);
        // In simulation, this is a no-op — firmware transfer is part of state machine
    }

    @Override
    public void startUpdate(String deviceId, String firmwareReleaseId, String targetVersion, boolean healthGatePasses) {
        InMemoryDeviceState state = deviceStates.get(deviceId);
        if (state == null || state.updateInProgress) {
            log.warn("[SIMULATOR] Cannot start update — device {} not found or update in progress", deviceId);
            return;
        }

        state.updateInProgress = true;
        String previousFirmware = state.firmwareVersion;
        String previousBank = state.activeBank;
        String inactiveBank = state.activeBank.equals("A") ? "B" : "A";

        log.info("[SIMULATOR] Starting OTA update on device {} — target v{} — healthGatePasses={}",
                deviceId, targetVersion, healthGatePasses);

        executor.submit(() -> {
            try {
                // Step 1: UPDATE_PENDING
                transition(state, "UPDATE_PENDING", "UPDATING", "YELLOW",
                        "SECURE OTA", "UPDATE PENDING", "v" + targetVersion, "PENDING",
                        deviceId, "UPDATE_STARTED", "INFO",
                        "OTA update initiated for firmware v" + targetVersion);
                sleep(2000);

                // Step 2: DOWNLOADING
                transition(state, "DOWNLOADING", "UPDATING", "YELLOW",
                        "SECURE OTA", "DOWNLOADING...", "v" + targetVersion, "0%",
                        deviceId, "UPDATE_DOWNLOADING", "INFO",
                        "Downloading firmware v" + targetVersion + " to inactive bank " + inactiveBank);
                sleep(3000);

                // Step 3: VERIFYING
                transition(state, "VERIFYING", "UPDATING", "BLUE",
                        "SECURE OTA", "VERIFYING...", "SHA-256 OK", "SIG: VALID",
                        deviceId, "UPDATE_VERIFYING", "INFO",
                        "Verifying firmware integrity — SHA-256 match, signature valid");
                sleep(2000);

                // Step 4: INSTALLING (write to inactive bank)
                if (inactiveBank.equals("A")) {
                    state.bankAFirmware = targetVersion;
                } else {
                    state.bankBFirmware = targetVersion;
                }
                transition(state, "INSTALLING", "UPDATING", "YELLOW",
                        "SECURE OTA", "INSTALLING...", "BANK " + inactiveBank, "WRITING...",
                        deviceId, "UPDATE_INSTALLING", "INFO",
                        "Installing firmware v" + targetVersion + " to bank " + inactiveBank);
                sleep(2000);

                // Step 5: REBOOTING
                transition(state, "REBOOTING", "UPDATING", "YELLOW",
                        "SECURE OTA", "REBOOTING...", "BANK " + inactiveBank, "PLEASE WAIT",
                        deviceId, "UPDATE_REBOOTING", "INFO",
                        "Device rebooting into bank " + inactiveBank + " with firmware v" + targetVersion);
                sleep(3000);

                // Step 6: HEALTH_CHECK
                state.firmwareVersion = targetVersion;
                state.activeBank = inactiveBank;
                transition(state, "HEALTH_CHECK", "UPDATING", "BLUE",
                        "SECURE OTA", "HEALTH CHECK", "FW: " + targetVersion, "CHECKING...",
                        deviceId, "HEALTH_CHECK_STARTED", "INFO",
                        "Running health gate — checking application vitals for firmware v" + targetVersion);
                sleep(4000);

                if (healthGatePasses) {
                    // === HAPPY PATH: CONFIRMED ===
                    state.health = 98;
                    transition(state, "CONFIRMED", "ONLINE", "GREEN",
                            "SECURE OTA", "FW: " + targetVersion, "BANK: " + inactiveBank, "HEALTHY",
                            deviceId, "FIRMWARE_CONFIRMED", "INFO",
                            "Firmware v" + targetVersion + " CONFIRMED on bank " + inactiveBank + ". Health gate passed.");
                    log.info("[SIMULATOR] Update CONFIRMED for device {} — v{} on bank {}", deviceId, targetVersion, inactiveBank);

                } else {
                    // === FAILURE PATH: HEALTH GATE FAILS ===
                    state.health = 12;

                    // FAILED
                    transition(state, "FAILED", "FAILED", "RED",
                            "SECURE OTA", "HEALTH FAILED", "FW: " + targetVersion, "CRITICAL",
                            deviceId, "HEALTH_CHECK_FAILED", "HIGH",
                            "HEALTH GATE FAILED for firmware v" + targetVersion + " — health dropped to " + state.health + "%");
                    sleep(2000);

                    // ROLLBACK
                    state.rollbackCount++;
                    // Restore previous firmware
                    state.activeBank = previousBank;
                    state.firmwareVersion = previousFirmware;
                    if (previousBank.equals("A")) {
                        state.bankAFirmware = previousFirmware;
                    } else {
                        state.bankBFirmware = previousFirmware;
                    }
                    state.health = 72;

                    transition(state, "ROLLBACK", "UPDATING", "RED",
                            "SECURE OTA", "ROLLBACK!", "FW: " + previousFirmware, "BANK: " + previousBank,
                            deviceId, "ROLLBACK_TRIGGERED", "HIGH",
                            "Automatic rollback executed — restored v" + previousFirmware + " on bank " + previousBank);
                    sleep(2000);

                    // SAFE_MODE
                    state.safeMode = true;
                    state.watchdogHealthy = false;
                    state.health = 35;

                    transition(state, "SAFE_MODE", "SAFE_MODE", "RED",
                            "SECURE OTA", "!SAFE MODE!", "FW: " + previousFirmware, "RECOVERY NEEDED",
                            deviceId, "SAFE_MODE_ENTERED", "CRITICAL",
                            "Device NXP-001 entered SAFE MODE after rollback. Manual recovery required.");

                    // Save security event
                    SecurityEvent secEvent = SecurityEvent.builder()
                            .deviceId(deviceId)
                            .eventType("HEALTH_FAILURE")
                            .severity("CRITICAL")
                            .description("Firmware v" + targetVersion + " passed integrity validation but failed operational health check. Rollback triggered. Device in SAFE MODE.")
                            .firmwareVersion(targetVersion)
                            .resolved(false)
                            .build();
                    securityEventRepository.save(secEvent);

                    log.error("[SIMULATOR] Device {} entered SAFE MODE after health gate failure for v{}", deviceId, targetVersion);
                }

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("[SIMULATOR] Update interrupted for device {}", deviceId);
            } catch (Exception e) {
                log.error("[SIMULATOR] Error during update for device {}: {}", deviceId, e.getMessage(), e);
            } finally {
                state.updateInProgress = false;
                saveAndBroadcast(deviceId);
            }
        });
    }

    private void transition(InMemoryDeviceState state, String updateState, String deviceStatus, String led,
                            String oled0, String oled1, String oled2, String oled3,
                            String deviceId, String eventType, String severity, String message) {
        state.updateState = updateState;
        state.status = deviceStatus;
        state.led = led;
        state.oledLine0 = oled0;
        state.oledLine1 = oled1;
        state.oledLine2 = oled2;
        state.oledLine3 = oled3;

        saveAndBroadcast(deviceId);
        createAndBroadcastEvent(deviceId, eventType, severity, message);
    }

    @Override
    public void requestRecovery(String deviceId) {
        InMemoryDeviceState state = deviceStates.get(deviceId);
        if (state == null) return;
        log.info("[SIMULATOR] Recovery requested for device {}", deviceId);
        state.updateState = "RECOVERY_PENDING";
        state.oledLine3 = "RECOVERY PEND";
        saveAndBroadcast(deviceId);
        createAndBroadcastEvent(deviceId, "RECOVERY_INITIATED", "MEDIUM",
                "Recovery process initiated for device " + deviceId + " — awaiting approval");
    }

    @Override
    public boolean isConnected(String deviceId) {
        InMemoryDeviceState state = deviceStates.get(deviceId);
        return state != null && "ONLINE".equals(state.status);
    }

    @Scheduled(fixedDelay = 2000)
    public void broadcastTelemetry() {
        for (InMemoryDeviceState state : deviceStates.values()) {
            // Simulate live sensor data
            state.uptime += 2;
            state.pirMotion = Math.random() < 0.15; // 15% chance of motion
            state.radarDistance = Math.round((0.5 + Math.random() * 3.5) * 100.0) / 100.0;

            // Keep heartbeat alive
            state.heartbeat = !"OFFLINE".equals(state.status);

            // Broadcast telemetry
            Map<String, Object> telemetry = buildTelemetryMap(state);
            messagingTemplate.convertAndSend("/topic/telemetry", telemetry);
        }
    }

    private void saveAndBroadcast(String deviceId) {
        InMemoryDeviceState state = deviceStates.get(deviceId);
        if (state == null) return;

        // Save to DB
        deviceRepository.findByDeviceId(deviceId).ifPresent(device -> {
            device.setStatus(state.status);
            device.setFirmwareVersion(state.firmwareVersion);
            device.setActiveBank(state.activeBank);
            device.setBankAFirmware(state.bankAFirmware);
            device.setBankBFirmware(state.bankBFirmware);
            device.setHealth(state.health);
            device.setLed(state.led);
            device.setOledLine0(state.oledLine0);
            device.setOledLine1(state.oledLine1);
            device.setOledLine2(state.oledLine2);
            device.setOledLine3(state.oledLine3);
            device.setPirMotion(state.pirMotion);
            device.setRadarDistance(state.radarDistance);
            device.setSafeMode(state.safeMode);
            device.setWatchdogHealthy(state.watchdogHealthy);
            device.setHeartbeat(state.heartbeat);
            device.setUptime(state.uptime);
            device.setUpdateState(state.updateState);
            device.setRollbackCount(state.rollbackCount);
            deviceRepository.save(device);
        });

        // Broadcast status via websocket
        messagingTemplate.convertAndSend("/topic/device-status", toDTO(state));
    }

    private void createAndBroadcastEvent(String deviceId, String eventType, String severity, String message) {
        DeviceEvent event = DeviceEvent.builder()
                .deviceId(deviceId)
                .eventType(eventType)
                .severity(severity)
                .message(message)
                .timestamp(Instant.now())
                .build();
        eventRepository.save(event);
        
        DeviceEventDTO dto = DeviceEventDTO.builder()
                .id(event.getId())
                .deviceId(event.getDeviceId())
                .eventType(event.getEventType())
                .severity(event.getSeverity())
                .message(event.getMessage())
                .timestamp(event.getTimestamp())
                .build();
        messagingTemplate.convertAndSend("/topic/events", dto);
    }

    private Map<String, Object> buildTelemetryMap(InMemoryDeviceState state) {
        Map<String, Object> tel = new HashMap<>();
        tel.put("deviceId", state.deviceId);
        tel.put("status", state.status);
        tel.put("health", state.health);
        tel.put("activeBank", state.activeBank);
        tel.put("pirMotion", state.pirMotion);
        tel.put("radarDistance", state.radarDistance);
        tel.put("uptime", state.uptime);
        return tel;
    }

    private DeviceDTO toDTO(InMemoryDeviceState state) {
        return DeviceDTO.builder()
                .deviceId(state.deviceId)
                .status(state.status)
                .firmwareVersion(state.firmwareVersion)
                .activeBank(state.activeBank)
                .bankAFirmware(state.bankAFirmware)
                .bankBFirmware(state.bankBFirmware)
                .health(state.health)
                .led(state.led)
                .oledLines(Arrays.asList(state.oledLine0, state.oledLine1, state.oledLine2, state.oledLine3))
                .pirMotion(state.pirMotion)
                .radarDistance(state.radarDistance)
                .safeMode(state.safeMode)
                .watchdogHealthy(state.watchdogHealthy)
                .heartbeat(state.heartbeat)
                .uptime(state.uptime)
                .updateState(state.updateState)
                .rollbackCount(state.rollbackCount)
                .isSimulated(true)
                .build();
    }

    private void sleep(long millis) throws InterruptedException {
        Thread.sleep(millis);
    }
}"""
}

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip() + "\n")

print("Files written successfully.")
