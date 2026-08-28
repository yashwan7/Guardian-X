package com.guardianota.service;

import com.guardianota.device.DeviceAdapter;
import com.guardianota.dto.DeviceDTO;
import com.guardianota.dto.FleetSummaryDTO;
import com.guardianota.entity.Device;
import com.guardianota.repository.DeviceRepository;
import com.guardianota.repository.SecurityEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceAdapter deviceAdapter;
    private final SecurityEventRepository securityEventRepository;

    public List<DeviceDTO> getAllDevices() {
        return deviceRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public DeviceDTO getDevice(String deviceId) {
        return deviceRepository.findByDeviceId(deviceId)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Device not found: " + deviceId));
    }

    public FleetSummaryDTO getFleetSummary() {
        List<Device> devices = deviceRepository.findAll();
        long healthy = devices.stream().filter(d -> "ONLINE".equals(d.getStatus())).count();
        long updating = devices.stream().filter(d -> "UPDATING".equals(d.getStatus())).count();
        long failed = devices.stream().filter(d -> "FAILED".equals(d.getStatus())).count();
        long safeMode = devices.stream().filter(d -> "SAFE_MODE".equals(d.getStatus())).count();
        long offline = devices.stream().filter(d -> "OFFLINE".equals(d.getStatus())).count();
        long recovering = devices.stream().filter(d -> "RECOVERING".equals(d.getStatus())).count();
        long totalRollbacks = devices.stream().mapToLong(d -> d.getRollbackCount() != null ? d.getRollbackCount() : 0).sum();
        long securityEvents = securityEventRepository.countByResolved(false);

        String activeFirmware = devices.stream()
                .filter(d -> "ONLINE".equals(d.getStatus()))
                .map(Device::getFirmwareVersion)
                .findFirst()
                .orElse("N/A");

        return FleetSummaryDTO.builder()
                .totalDevices(devices.size())
                .healthy(healthy)
                .updating(updating)
                .failed(failed)
                .safeMode(safeMode)
                .offline(offline)
                .recovering(recovering)
                .activeFirmware(activeFirmware)
                .rollbackCount(totalRollbacks)
                .securityEvents(securityEvents)
                .build();
    }

    private DeviceDTO toDTO(Device d) {
        List<String> oledLines = Arrays.asList(
                d.getOledLine0() != null ? d.getOledLine0() : "",
                d.getOledLine1() != null ? d.getOledLine1() : "",
                d.getOledLine2() != null ? d.getOledLine2() : "",
                d.getOledLine3() != null ? d.getOledLine3() : ""
        );
        String inactiveBank = "A".equals(d.getActiveBank()) ? "B" : "A";
        return DeviceDTO.builder()
                .id(d.getId())
                .deviceId(d.getDeviceId())
                .name(d.getName())
                .status(d.getStatus())
                .firmwareVersion(d.getFirmwareVersion())
                .activeBank(d.getActiveBank())
                .inactiveBank(inactiveBank)
                .bankAFirmware(d.getBankAFirmware())
                .bankBFirmware(d.getBankBFirmware())
                .health(d.getHealth())
                .led(d.getLed())
                .oledLines(oledLines)
                .pirMotion(d.getPirMotion())
                .radarDistance(d.getRadarDistance() != null ? d.getRadarDistance().doubleValue() : 0.0)
                .safeMode(d.getSafeMode())
                .watchdogHealthy(d.getWatchdogHealthy())
                .heartbeat(d.getHeartbeat())
                .uptime(d.getUptime())
                .lastSeen(d.getLastSeen())
                .updateState(d.getUpdateState())
                .rollbackCount(d.getRollbackCount())
                .targetHardware(d.getTargetHardware())
                .isSimulated(d.getIsSimulated())
                .build();
    }
}
