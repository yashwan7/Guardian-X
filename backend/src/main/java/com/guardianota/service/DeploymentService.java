package com.guardianota.service;

import com.guardianota.device.DeviceAdapter;
import com.guardianota.dto.DeploymentRequestDTO;
import com.guardianota.entity.Deployment;
import com.guardianota.entity.FirmwareRelease;
import com.guardianota.repository.DeploymentRepository;
import com.guardianota.repository.FirmwareReleaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeploymentService {

    private final DeploymentRepository deploymentRepository;
    private final FirmwareReleaseRepository firmwareReleaseRepository;
    private final FirmwareService firmwareService;
    private final DeviceAdapter deviceAdapter;

    public Deployment createDeployment(DeploymentRequestDTO request) {
        FirmwareRelease release = firmwareService.getReleaseEntity(request.getFirmwareReleaseId());

        Deployment deployment = Deployment.builder()
                .firmwareRelease(release)
                .deviceId(request.getDeviceId())
                .status("IN_PROGRESS")
                .currentState("UPDATE_PENDING")
                .build();
        Deployment saved = deploymentRepository.save(deployment);

        release.setDeploymentCount(release.getDeploymentCount() + 1);
        firmwareReleaseRepository.save(release);

        deviceAdapter.startUpdate(
                request.getDeviceId(),
                release.getId().toString(),
                release.getVersion(),
                release.getHealthGatePasses()
        );

        log.info("[DEPLOYMENT] Created deployment {} for firmware {} on device {}",
                saved.getId(), release.getVersion(), request.getDeviceId());
        return saved;
    }

    public List<Deployment> getAllDeployments() {
        return deploymentRepository.findAllByOrderByStartedAtDesc();
    }
}
