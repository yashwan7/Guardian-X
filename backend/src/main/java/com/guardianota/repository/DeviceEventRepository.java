package com.guardianota.repository;

import com.guardianota.entity.DeviceEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DeviceEventRepository extends JpaRepository<DeviceEvent, UUID> {
    List<DeviceEvent> findTop50ByOrderByTimestampDesc();
    List<DeviceEvent> findByDeviceIdOrderByTimestampDesc(String deviceId);
}
