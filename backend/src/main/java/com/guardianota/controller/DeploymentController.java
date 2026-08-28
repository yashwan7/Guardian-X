package com.guardianota.controller;

import com.guardianota.dto.DeploymentRequestDTO;
import com.guardianota.entity.Deployment;
import com.guardianota.service.DeploymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deployments")
@RequiredArgsConstructor
public class DeploymentController {

    private final DeploymentService deploymentService;

    @PostMapping
    public ResponseEntity<Deployment> createDeployment(@Valid @RequestBody DeploymentRequestDTO request) {
        return ResponseEntity.ok(deploymentService.createDeployment(request));
    }

    @GetMapping
    public ResponseEntity<List<Deployment>> getAllDeployments() {
        return ResponseEntity.ok(deploymentService.getAllDeployments());
    }
}
