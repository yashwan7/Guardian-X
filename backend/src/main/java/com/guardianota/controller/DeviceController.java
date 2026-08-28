package com.guardianota.controller;

import com.guardianota.dto.DeviceDTO;
import com.guardianota.dto.FleetSummaryDTO;
import com.guardianota.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping("/devices")
    public ResponseEntity<List<DeviceDTO>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @GetMapping("/devices/{deviceId}")
    public ResponseEntity<DeviceDTO> getDevice(@PathVariable String deviceId) {
        return ResponseEntity.ok(deviceService.getDevice(deviceId));
    }

    @GetMapping("/fleet/summary")
    public ResponseEntity<FleetSummaryDTO> getFleetSummary() {
        return ResponseEntity.ok(deviceService.getFleetSummary());
    }
}
