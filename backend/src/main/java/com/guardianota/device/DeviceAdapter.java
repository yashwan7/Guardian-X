package com.guardianota.device;

import com.guardianota.dto.DeviceDTO;

public interface DeviceAdapter {
    /**
     * Connect to the device.
     * For simulated: initializes in-memory state.
     * For real NXP: establishes MQTT connection.
     */
    void connect(String deviceId);

    /**
     * Disconnect from device.
     */
    void disconnect(String deviceId);

    /**
     * Get current device status.
     */
    DeviceDTO getStatus(String deviceId);

    /**
     * Send firmware binary to device.
     * For simulated: stores release ID for state machine.
     * For real NXP: transfers firmware via MQTT/XMODEM/etc.
     */
    void sendFirmware(String deviceId, String firmwareReleaseId);

    /**
     * Start OTA update process.
     * @param isBreakingDemo If true, the update will simulate a health gate failure and rollback.
     */
    void startUpdate(String deviceId, String firmwareReleaseId, String targetVersion, boolean healthGatePasses);

    /**
     * Request device recovery from SAFE_MODE.
     */
    void requestRecovery(String deviceId);

    /**
     * Check if device is connected.
     */
    boolean isConnected(String deviceId);
}
