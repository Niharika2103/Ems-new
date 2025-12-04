package com.example.attendance_service.repository;

import com.example.attendance_service.model.ProbationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface ProbationRepository extends JpaRepository<ProbationEntity, Long> {

	@Query("""
		    SELECT p FROM ProbationEntity p
		    WHERE p.employeeId = :userId
		      AND LOWER(p.status) = LOWER(:status)
		      AND :date BETWEEN p.startDate AND p.endDate
		""")
		Optional<ProbationEntity> findProbationForDate(
		        @Param("userId") UUID userId,
		        @Param("status") String status,
		        @Param("date") LocalDate date
		);


}




