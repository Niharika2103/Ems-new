package com.example.attendance_service.repository;

import com.example.attendance_service.model.ProbationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProbationRepository extends JpaRepository<ProbationEntity, Long> {

    @Query("SELECT p FROM ProbationEntity p " +
            "WHERE p.usermasterid = :userId AND LOWER(p.status) = LOWER(:status)")
    Optional<ProbationEntity> findActiveProbation(
            @Param("userId") UUID userId,
            @Param("status") String status
    );
}

