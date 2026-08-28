package com.guardianota.dto;

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
}
