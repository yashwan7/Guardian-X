package com.guardianota.controller;

import com.guardianota.dto.FirmwareReleaseDTO;
import com.guardianota.service.FirmwareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/firmware")
@RequiredArgsConstructor
public class FirmwareController {

    private final FirmwareService firmwareService;

    @GetMapping
    public ResponseEntity<List<FirmwareReleaseDTO>> getAllReleases() {
        return ResponseEntity.ok(firmwareService.getAllReleases());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FirmwareReleaseDTO> getRelease(@PathVariable UUID id) {
        return ResponseEntity.ok(firmwareService.getRelease(id));
    }
}
