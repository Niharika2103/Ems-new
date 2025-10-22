package com.example.attendance_service.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.attendance_service.model.AttendanceEntity;


@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceEntity, UUID> {
	

    // ✅ check if attendance already exists for a given employee + date
    boolean existsByEmployee_IdAndDate(UUID employeeId, LocalDate date);
	List<AttendanceEntity> findByEmployee_IdOrderByDateAsc(UUID employeeId);

	List<AttendanceEntity> findByProject_IdOrderByDateAsc(UUID projectId);
	Optional<AttendanceEntity> findTopByEmployee_IdOrderByDateDesc(UUID employeeId);

	

	List<AttendanceEntity> findByEmployee_IdAndProject_IdOrderByDateAsc(UUID employeeId, UUID projectId);


	 Optional<AttendanceEntity> findByEmployee_IdAndProject_IdAndDate(UUID employeeId, UUID projectId, LocalDate date);

  
	List<AttendanceEntity> findAllByOrderByDateAsc();
	List<AttendanceEntity> findByEmployee_IdAndDateBetween(UUID employeeId, LocalDate startDate, LocalDate endDate);

	
	List<AttendanceEntity> findByEmployee_IdAndProject_IdAndDateBetween(
		    UUID employeeId,
		    UUID projectId,
		    LocalDate startDate,
		    LocalDate endDate
		);

}
