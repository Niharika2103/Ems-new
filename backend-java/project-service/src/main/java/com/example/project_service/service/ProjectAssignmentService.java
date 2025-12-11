package com.example.project_service.service;

import com.example.project_service.model.ProjectAssignmentEntity;
import com.example.project_service.model.Projects;
import com.example.project_service.dto.ProjectAssignmentDTO;
import com.example.project_service.repository.ProjectAssignmentRepository;
import com.example.project_service.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ProjectAssignmentService {

    private final ProjectAssignmentRepository assignmentRepository;
    private final ProjectRepository projectRepository;

    // Manual constructor for dependency injection
    public ProjectAssignmentService(ProjectAssignmentRepository assignmentRepository,
                                    ProjectRepository projectRepository) {
        this.assignmentRepository = assignmentRepository;
        this.projectRepository = projectRepository;
    }

    public ProjectAssignmentEntity assignProjectToEmployee(UUID projectId, UUID employeeId, String role ,String employee_type) {
        Projects project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Build entity manually without Lombok
        ProjectAssignmentEntity assignment = new ProjectAssignmentEntity();
        assignment.setEmployeeId(employeeId);
        assignment.setProject(project);
        assignment.setEmployee_type(employee_type);
        assignment.setRole(role);
        assignment.setAssignedAt(LocalDateTime.now());


        return assignmentRepository.save(assignment);
    }
    
    public List<ProjectAssignmentEntity> getProjectsByEmployeeId(UUID employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId);
    }
    
    public List<ProjectAssignmentDTO> getAllAssignments() {
        return assignmentRepository.findAll().stream().map(a -> {
            Projects project = a.getProject();
            String employeeName = assignmentRepository.findEmployeeNameById(a.getEmployeeId());

            return new ProjectAssignmentDTO(
                    project.getId(),
                    project.getName(),
                    project.getDescription(),
                    a.getEmployeeId(),
                    employeeName,
                    a.getRole(),
                    a.getAssignedAt()
            );
        }).collect(Collectors.toList());
    }

}
