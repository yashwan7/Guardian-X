package com.guardianota.controller;

import com.guardianota.dto.DeviceEventDTO;
import com.guardianota.entity.SecurityEvent;
import com.guardianota.repository.DeviceEventRepository;
import com.guardianota.repository.SecurityEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final DeviceEventRepository deviceEventRepository;
    private final SecurityEventRepository securityEventRepository;

    @GetMapping
    public ResponseEntity<List<DeviceEventDTO>> getEvents() {
        List<DeviceEventDTO> events = deviceEventRepository.findTop50ByOrderByTimestampDesc()
                .stream()
                .map(e -> DeviceEventDTO.builder()
                        .id(e.getId())
                        .deviceId(e.getDeviceId())
                        .eventType(e.getEventType())
                        .severity(e.getSeverity())
                        .message(e.getMessage())
                        .timestamp(e.getTimestamp())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(events);
    }

    @GetMapping("/security")
    public ResponseEntity<List<SecurityEvent>> getSecurityEvents() {
        return ResponseEntity.ok(securityEventRepository.findAllByOrderByTimestampDesc());
    }
}
