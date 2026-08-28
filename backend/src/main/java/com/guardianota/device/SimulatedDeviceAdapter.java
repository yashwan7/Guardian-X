package com.guardianota.device;

import com.guardianota.dto.DeviceDTO;
import com.guardianota.dto.DeviceEventDTO;
import com.guardianota.entity.Device;
import com.guardianota.entity.DeviceEvent;
import com.guardianota.entity.SecurityEvent;
import com.guardianota.repository.DeviceEventRepository;
import com.guardianota.repository.DeviceRepository;
import com.guardianota.repository.SecurityEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class SimulatedDeviceAdapter implements DeviceAdapter {

    private final SimpMessagingTemplate messagingTemplate;
    private final DeviceRepository deviceRepository;
    private final DeviceEventRepository eventRepository;
    private final SecurityEventRepository securityEventRepository;

    // In-memory device states for simulation
    private final Map<String, InMemoryDeviceState> deviceStates = new ConcurrentHashMap<>();
    private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(4);

    private static class InMemoryDeviceState {
        String deviceId;
        String firmwareVersion = "1.0.0";
        String activeBank = "A";
        String bankAFirmware = "1.0.0";
        String bankBFirmware = null;
        int health = 98;
        String led = "GREEN";
        String oledLine0 = "SECURE OTA";
        String oledLine1 = "FW: 1.0.0";
        String oledLine2 = "BANK: A";
        String oledLine3 = "HEALTHY";
        boolean pirMotion = false;
        double radarDistance = 0.0;
        boolean safeMode = false;
        boolean watchdogHealthy = true;
        boolean heartbeat = true;
        long uptime = 0;
        String updateState = "IDLE";
        String status = "ONLINE";
        int rollbackCount = 0;
        volatile boolean updateInProgress = false;

        InMemoryDeviceState(String deviceId) {
            this.deviceId = deviceId;
        }
    }

    @PostConstruct
    public void init() {
        // Initialize state from DB
        List<Device> devices = deviceRepository.findAll();
        for (Device d : devices) {
            InMemoryDeviceState state = new InMemoryDeviceState(d.getDeviceId());
            state.firmwareVersion = d.getFirmwareVersion();
            state.activeBank = d.getActiveBank();
            state.bankAFirmware = d.getBankAFirmware();
            state.bankBFirmware = d.getBankBFirmware();
            state.health = d.getHealth() != null ? d.getHealth() : 98;
            state.led = d.getLed() != null ? d.getLed() : "GREEN";
            state.safeMode = d.getSafeMode() != null && d.getSafeMode();
            state.watchdogHealthy = d.getWatchdogHealthy() == null || d.getWatchdogHealthy();
            state.heartbeat = d.getHeartbeat() != null && d.getHeartbeat();
            state.uptime = d.getUptime() != null ? d.getUptime() : 0;
            state.updateState = d.getUpdateState() != null ? d.getUpdateState() : "IDLE";
            state.status = d.getStatus() != null ? d.getStatus() : "ONLINE";
            state.rollbackCount = d.getRollbackCount() != null ? d.getRollbackCount() : 0;
            deviceStates.put(d.getDeviceId(), state);
            log.info("[SIMULATOR] Initialized device {} from DB", d.getDeviceId());
        }
    }

    @Override
    public void connect(String deviceId) {
        log.info("[SIMULATOR] Connecting to device {}", deviceId);
        if (!deviceStates.containsKey(deviceId)) {
            deviceStates.put(deviceId, new InMemoryDeviceState(deviceId));
        }
        deviceStates.get(deviceId).status = "ONLINE";
        deviceStates.get(deviceId).heartbeat = true;
        saveAndBroadcast(deviceId);
    }

    @Override
    public void disconnect(String deviceId) {
        log.info("[SIMULATOR] Disconnecting device {}", deviceId);
        InMemoryDeviceState state = deviceStates.get(deviceId);
        if (state != null) {
            state.status = "OFFLINE";
            state.heartbeat = false;
            saveAndBroadcast(deviceId);
        }
    }

    @Override
    public DeviceDTO getStatus(String deviceId) {
        InMemoryDeviceState state = deviceStates.get(deviceId);
        if (state == null) return null;
        return toDTO(state);
    }

    @Override
    public void sendFirmware(String deviceId, String firmwareReleaseId) {
        log.info("[SIMULATOR] Sending firmware {} to device {}", firmwareReleaseId, deviceId);
        // In simulation, this is a no-op — firmware transfer is part of state machine
    }

    @Override
    public void startUpdate(String deviceId, String firmwareReleaseId, String targetVersion, boolean healthGatePasses) {
        InMemoryDeviceState state = deviceStates.get(deviceId);
        if (state == null || state.updateInProgress) {
            log.warn("[SIMULATOR] Cannot start update — device {} not found or update in progress", deviceId);
            return;
        }

        state.updateInProgress = true;
        String previousFirmware = state.firmwareVersion;
        String previousBank = state.activeBank;
        String inactiveBank = state.activeBank.equals("A") ? "B" : "A";

        log.info("[SIMULATOR] Starting OTA update on device {} — target v{} — healthGatePasses={}",
                deviceId, targetVersion, healthGatePasses);

        executor.submit(() -> {
            try {
                // Step 1: UPDATE_PENDING
                transition(state, "UPDATE_PENDING", "UPDATING", "YELLOW",
                        "SECURE OTA", "UPDATE PENDING", "v" + targetVersion, "PENDING",
                        deviceId, "UPDATE_STARTED", "INFO",
                        "OTA update initiated for firmware v" + targetVersion);
                sleep(2000);

                // Step 2: DOWNLOADING
                transition(state, "DOWNLOADING", "UPDATING", "YELLOW",
                        "SECURE OTA", "DOWNLOADING...", "v" + targetVersion, "0%",
                        deviceId, "UPDATE_DOWNLOADING", "INFO",
                        "Downloading firmware v" + targetVersion + " to inactive bank " + inactiveBank);
                sleep(3000);

                // Step 3: VERIFYING
                transition(state, "VERIFYING", "UPDATING", "BLUE",
                        "SECURE OTA", "VERIFYING...", "SHA-256 OK", "SIG: VALID",
                        deviceId, "UPDATE_VERIFYING", "INFO",
                        "Verifying firmware integrity — SHA-256 match, signature valid");
                sleep(2000);

                // Step 4: INSTALLING (write to inactive bank)
                if (inactiveBank.equals("A")) {
                    state.bankAFirmware = targetVersion;
                } else {
                    state.bankBFirmware = targetVersion;
                }
                transition(state, "INSTALLING", "UPDATING", "YELLOW",
                        "SECURE OTA", "INSTALLING...", "BANK " + inactiveBank, "WRITING...",
                        deviceId, "UPDATE_INSTALLING", "INFO",
                        "Installing firmware v" + targetVersion + " to bank " + inactiveBank);
                sleep(2000);

                // Step 5: REBOOTING
                transition(state, "REBOOTING", "UPDATING", "YELLOW",
                        "SECURE OTA", "REBOOTING...", "BANK " + inactiveBank, "PLEASE WAIT",
                        deviceId, "UPDATE_REBOOTING", "INFO",
                        "Device rebooting into bank " + inactiveBank + " with firmware v" + targetVersion);
                sleep(3000);

                // Step 6: HEALTH_CHECK
                state.firmwareVersion = targetVersion;
                state.activeBank = inactiveBank;
                transition(state, "HEALTH_CHECK", "UPDATING", "BLUE",
                        "SECURE OTA", "HEALTH CHECK", "FW: " + targetVersion, "CHECKING...",
                        deviceId, "HEALTH_CHECK_STARTED", "INFO",
                        "Running health gate — checking application vitals for firmware v" + targetVersion);
                sleep(4000);

                if (healthGatePasses) {
                    // === HAPPY PATH: CONFIRMED ===
                    state.health = 98;
                    transition(state, "CONFIRMED", "ONLINE", "GREEN",
                            "SECURE OTA", "FW: " + targetVersion, "BANK: " + inactiveBank, "HEALTHY",
                            deviceId, "FIRMWARE_CONFIRMED", "INFO",
                            "Firmware v" + targetVersion + " CONFIRMED on bank " + inactiveBank + ". Health gate passed.");
                    log.info("[SIMULATOR] Update CONFIRMED for device {} — v{} on bank {}", deviceId, targetVersion, inactiveBank);

                } else {
                    // === FAILURE PATH: HEALTH GATE FAILS ===
                    state.health = 12;

                    // FAILED
                    transition(state, "FAILED", "FAILED", "RED",
                            "SECURE OTA", "HEALTH FAILED", "FW: " + targetVersion, "CRITICAL",
                            deviceId, "HEALTH_CHECK_FAILED", "HIGH",
                            "HEALTH GATE FAILED for firmware v" + targetVersion + " — health dropped to " + state.health + "%");
                    sleep(2000);

                    // ROLLBACK
                    state.rollbackCount++;
                    // Restore previous firmware
                    state.activeBank = previousBank;
                    state.firmwareVersion = previousFirmware;
                    if (previousBank.equals("A")) {
                        state.bankAFirmware = previousFirmware;
                    } else {
                        state.bankBFirmware = previousFirmware;
                    }
                    state.health = 72;

                    transition(state, "ROLLBACK", "UPDATING", "RED",
                            "SECURE OTA", "ROLLBACK!", "FW: " + previousFirmware, "BANK: " + previousBank,
                            deviceId, "ROLLBACK_TRIGGERED", "HIGH",
                            "Automatic rollback executed — restored v" + previousFirmware + " on bank " + previousBank);
                    sleep(2000);

                    // SAFE_MODE
                    state.safeMode = true;
                    state.watchdogHealthy = false;
                    state.health = 35;

                    transition(state, "SAFE_MODE", "SAFE_MODE", "RED",
                            "SECURE OTA", "!SAFE MODE!", "FW: " + previousFirmware, "RECOVERY NEEDED",
                            deviceId, "SAFE_MODE_ENTERED", "CRITICAL",
                            "Device NXP-001 entered SAFE MODE after rollback. Manual recovery required.");

                    // Save security event
                    SecurityEvent secEvent = SecurityEvent.builder()
                            .deviceId(deviceId)
                            .eventType("HEALTH_FAILURE")
                            .severity("CRITICAL")
                            .description("Firmware v" + targetVersion + " passed integrity validation but failed operational health check. Rollback triggered. Device in SAFE MODE.")
                            .firmwareVersion(targetVersion)
                            .resolved(false)
                            .build();
                    securityEventRepository.save(secEvent);

                    log.error("[SIMULATOR] Device {} entered SAFE MODE after health gate failure for v{}", deviceId, targetVersion);
                }

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("[SIMULATOR] Update interrupted for device {}", deviceId);
            } catch (Exception e) {
                log.error("[SIMULATOR] Error during update for device {}: {}", deviceId, e.getMessage(), e);
            } finally {
                state.updateInProgress = false;
                saveAndBroadcast(deviceId);
            }
        });
    }

    private void transition(InMemoryDeviceState state, String updateState, String deviceStatus, String led,
                            String oled0, String oled1, String oled2, String oled3,
                            String deviceId, String eventType, String severity, String message) {
        state.updateState = updateState;
        state.status = deviceStatus;
        state.led = led;
        state.oledLine0 = oled0;
        state.oledLine1 = oled1;
        state.oledLine2 = oled2;
        state.oledLine3 = oled3;

        saveAndBroadcast(deviceId);
        createAndBroadcastEvent(deviceId, eventType, severity, message);
    }

    @Override
    public void requestRecovery(String deviceId) {
        InMemoryDeviceState state = deviceStates.get(deviceId);
        if (state == null) return;
        log.info("[SIMULATOR] Recovery requested for device {}", deviceId);
        state.updateState = "RECOVERY_PENDING";
        state.oledLine3 = "RECOVERY PEND";
        saveAndBroadcast(deviceId);
        createAndBroadcastEvent(deviceId, "RECOVERY_INITIATED", "MEDIUM",
                "Recovery process initiated for device " + deviceId + " — awaiting approval");
    }

    @Override
    public boolean isConnected(String deviceId) {
        InMemoryDeviceState state = deviceStates.get(deviceId);
        return state != null && "ONLINE".equals(state.status);
    }

    @Scheduled(fixedDelay = 2000)
    public void broadcastTelemetry() {
        for (InMemoryDeviceState state : deviceStates.values()) {
            // Simulate live sensor data
            state.uptime += 2;
            state.pirMotion = Math.random() < 0.15; // 15% chance of motion
            state.radarDistance = Math.round((0.5 + Math.random() * 3.5) * 100.0) / 100.0;

            // Keep heartbeat alive
            state.heartbeat = !"OFFLINE".equals(state.status);

            // Broadcast telemetry
            Map<String, Object> telemetry = buildTelemetryMap(state);
            messagingTemplate.convertAndSend("/topic/telemetry", telemetry);
        }
    }

    private void saveAndBroadcast(String deviceId) {
        InMemoryDeviceState state = deviceStates.get(deviceId);
        if (state == null) return;

        // Save to DB
        deviceRepository.findByDeviceId(deviceId).ifPresent(device -> {
            device.setStatus(state.status);
            device.setFirmwareVersion(state.firmwareVersion);
            device.setActiveBank(state.activeBank);
            device.setBankAFirmware(state.bankAFirmware);
            device.setBankBFirmware(state.bankBFirmware);
            device.setHealth(state.health);
            device.setLed(state.led);
            device.setOledLine0(state.oledLine0);
            device.setOledLine1(state.oledLine1);
            device.setOledLine2(state.oledLine2);
            device.setOledLine3(state.oledLine3);
            device.setPirMotion(state.pirMotion);
            device.setRadarDistance(state.radarDistance);
            device.setSafeMode(state.safeMode);
            device.setWatchdogHealthy(state.watchdogHealthy);
            device.setHeartbeat(state.heartbeat);
            device.setUptime(state.uptime);
            device.setUpdateState(state.updateState);
            device.setRollbackCount(state.rollbackCount);
            deviceRepository.save(device);
        });

        // Broadcast status via websocket
        messagingTemplate.convertAndSend("/topic/device-status", toDTO(state));
    }

    private void createAndBroadcastEvent(String deviceId, String eventType, String severity, String message) {
        DeviceEvent event = DeviceEvent.builder()
                .deviceId(deviceId)
                .eventType(eventType)
                .severity(severity)
                .message(message)
                .timestamp(Instant.now())
                .build();
        eventRepository.save(event);
        
        DeviceEventDTO dto = DeviceEventDTO.builder()
                .id(event.getId())
                .deviceId(event.getDeviceId())
                .eventType(event.getEventType())
                .severity(event.getSeverity())
                .message(event.getMessage())
                .timestamp(event.getTimestamp())
                .build();
        messagingTemplate.convertAndSend("/topic/events", dto);
    }

    private Map<String, Object> buildTelemetryMap(InMemoryDeviceState state) {
        Map<String, Object> tel = new HashMap<>();
        tel.put("deviceId", state.deviceId);
        tel.put("status", state.status);
        tel.put("health", state.health);
        tel.put("activeBank", state.activeBank);
        tel.put("pirMotion", state.pirMotion);
        tel.put("radarDistance", state.radarDistance);
        tel.put("uptime", state.uptime);
        return tel;
    }

    private DeviceDTO toDTO(InMemoryDeviceState state) {
        return DeviceDTO.builder()
                .deviceId(state.deviceId)
                .status(state.status)
                .firmwareVersion(state.firmwareVersion)
                .activeBank(state.activeBank)
                .bankAFirmware(state.bankAFirmware)
                .bankBFirmware(state.bankBFirmware)
                .health(state.health)
                .led(state.led)
                .oledLines(Arrays.asList(state.oledLine0, state.oledLine1, state.oledLine2, state.oledLine3))
                .pirMotion(state.pirMotion)
                .radarDistance(state.radarDistance)
                .safeMode(state.safeMode)
                .watchdogHealthy(state.watchdogHealthy)
                .heartbeat(state.heartbeat)
                .uptime(state.uptime)
                .updateState(state.updateState)
                .rollbackCount(state.rollbackCount)
                .isSimulated(true)
                .build();
    }

    private void sleep(long millis) throws InterruptedException {
        Thread.sleep(millis);
    }
}
