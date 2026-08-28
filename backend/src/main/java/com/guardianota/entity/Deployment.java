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
}
