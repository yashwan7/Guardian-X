package com.guardianota.dto;

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
}
