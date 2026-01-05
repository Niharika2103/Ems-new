//package com.example.project_service.repository;
//
//import com.example.project_service.model.ProjectAssignmentEntity;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import java.util.UUID;
//import java.util.List;
//
//@Repository 
//public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignmentEntity, UUID> {
//
//    List<ProjectAssignmentEntity> findByEmployeeId(UUID employeeId);
//    List<ProjectAssignmentEntity> findByProjectId(UUID projectId);
//    
//    // Add this method to fetch employee name from user_employee_master
//    @Query(value = "SELECT name FROM user_employees_master WHERE id = :employeeId", nativeQuery = true)
//    String findEmployeeNameById(@Param("employeeId") UUID employeeId);
//}

package com.example.project_service.repository;

import com.example.project_service.model.ProjectAssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectAssignmentRepository
        extends JpaRepository<ProjectAssignmentEntity, UUID> {

    List<ProjectAssignmentEntity> findByEmployeeIdAndEndDateIsNull(UUID employeeId);

    List<ProjectAssignmentEntity> findByProject_Id(UUID projectId);

    Optional<ProjectAssignmentEntity> findByProject_IdAndEmployeeId(
            UUID projectId,
            UUID employeeId
    );

    Optional<ProjectAssignmentEntity>
    findTopByProject_IdOrderByAssignedAtDesc(UUID projectId);

    @Query(
        value = "SELECT name FROM user_employees_master WHERE id = :employeeId",
        nativeQuery = true
    )
    String findEmployeeNameById(@Param("employeeId") UUID employeeId);

	boolean existsByEmployeeIdAndEndDateIsNull(UUID employeeId);
}
