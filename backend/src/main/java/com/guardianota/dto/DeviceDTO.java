package com.guardianota.dto;

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
}
