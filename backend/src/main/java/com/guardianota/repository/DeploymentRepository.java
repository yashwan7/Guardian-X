package com.guardianota.repository;

import com.guardianota.entity.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, UUID> {
    List<Deployment> findAllByOrderByStartedAtDesc();
    List<Deployment> findByDeviceIdOrderByStartedAtDesc(String deviceId);
}
