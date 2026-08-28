package com.guardianota.dto;

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
}
