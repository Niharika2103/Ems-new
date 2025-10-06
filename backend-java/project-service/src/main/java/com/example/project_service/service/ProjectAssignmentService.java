package com.example.project_service.service;


import com.example.project_service.model.ProjectAssignmentEntity;
import com.example.project_service.repository.ProjectAssignmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectAssignmentService {

    private final ProjectAssignmentRepository assignmentRepository;

    public ProjectAssignmentService(ProjectAssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    public ProjectAssignmentEntity assignEmployee(ProjectAssignmentEntity assignment) {
        return assignmentRepository.save(assignment);
    }

    public List<ProjectAssignmentEntity> getAssignmentsByEmployee(Long employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId);
    }

    public List<ProjectAssignmentEntity> getAssignmentsByProject(Long projectId) {
        return assignmentRepository.findByProjectId(projectId);
    }
}

