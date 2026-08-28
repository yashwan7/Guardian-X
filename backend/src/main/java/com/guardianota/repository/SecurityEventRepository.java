package com.guardianota.repository;

import com.guardianota.entity.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, UUID> {
    List<SecurityEvent> findAllByOrderByTimestampDesc();
    long countByResolved(Boolean resolved);
}
