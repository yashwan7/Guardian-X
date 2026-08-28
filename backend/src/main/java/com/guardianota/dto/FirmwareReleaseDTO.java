package com.guardianota.dto;

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
}
