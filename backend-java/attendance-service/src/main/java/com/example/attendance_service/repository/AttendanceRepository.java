package com.example.attendance_service.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.attendance_service.model.AttendanceEntity;


@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceEntity, UUID> {

	List<AttendanceEntity> findByEmployee_IdOrderByDateAsc(UUID employeeId);

	List<AttendanceEntity> findByProject_IdOrderByDateAsc(UUID projectId);

	List<AttendanceEntity> findByEmployee_IdAndProject_IdOrderByDateAsc(UUID employeeId, UUID projectId);




	List<AttendanceEntity> findAllByOrderByDateAsc();
}
