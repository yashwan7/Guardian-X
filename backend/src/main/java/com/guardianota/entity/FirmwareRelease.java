package com.guardianota.entity;

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
}
