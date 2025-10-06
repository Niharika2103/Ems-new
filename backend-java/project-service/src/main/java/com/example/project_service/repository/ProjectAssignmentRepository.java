package com.example.project_service.repository;


import com.example.project_service.model.ProjectAssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignmentEntity, Long> {
    List<ProjectAssignmentEntity> findByEmployeeId(Long employeeId);
    List<ProjectAssignmentEntity> findByProjectId(Long projectId);
}

