package com.guardianota.service;

import com.guardianota.dto.FirmwareReleaseDTO;
import com.guardianota.entity.FirmwareRelease;
import com.guardianota.repository.FirmwareReleaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FirmwareService {

    private final FirmwareReleaseRepository firmwareReleaseRepository;

    public List<FirmwareReleaseDTO> getAllReleases() {
        return firmwareReleaseRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public FirmwareReleaseDTO getRelease(UUID id) {
        return firmwareReleaseRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Firmware release not found: " + id));
    }

    public FirmwareRelease getReleaseEntity(UUID id) {
        return firmwareReleaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Firmware release not found: " + id));
    }

    private FirmwareReleaseDTO toDTO(FirmwareRelease fr) {
        return FirmwareReleaseDTO.builder()
                .id(fr.getId())
                .name(fr.getName())
                .version(fr.getVersion())
                .type(fr.getType())
                .sha256(fr.getSha256())
                .signatureStatus(fr.getSignatureStatus())
                .targetHardware(fr.getTargetHardware())
                .minimumBootloader(fr.getMinimumBootloader())
                .status(fr.getStatus())
                .description(fr.getDescription())
                .healthGatePasses(fr.getHealthGatePasses())
                .isBreakingDemo(fr.getIsBreakingDemo())
                .deploymentCount(fr.getDeploymentCount())
                .createdAt(fr.getCreatedAt())
                .build();
    }
}
