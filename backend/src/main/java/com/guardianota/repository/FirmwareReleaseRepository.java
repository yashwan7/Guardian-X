package com.guardianota.repository;

import com.guardianota.entity.FirmwareRelease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FirmwareReleaseRepository extends JpaRepository<FirmwareRelease, UUID> {
    Optional<FirmwareRelease> findByVersion(String version);
    List<FirmwareRelease> findAllByOrderByCreatedAtDesc();
}
