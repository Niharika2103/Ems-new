package com.example.attendance_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.attendance_service.model.LeaveTypeEntity;

public interface LeaveTypeRepository extends JpaRepository<LeaveTypeEntity, UUID> {

    Optional<LeaveTypeEntity> findByCodeIgnoreCaseAndIsActiveTrue(String code);
}
