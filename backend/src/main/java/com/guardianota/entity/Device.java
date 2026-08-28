package com.guardianota.entity;

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
}
