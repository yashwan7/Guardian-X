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
}
