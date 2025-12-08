package com.example.project_service.controller;

import com.example.project_service.model.ProjectAssignmentEntity;
import com.example.project_service.service.ProjectAssignmentService;
import com.example.project_service.dto.ProjectAssignmentDTO;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/projects")
public class ProjectAssignmentController {

    private final ProjectAssignmentService projectAssignmentService;

    
    public ProjectAssignmentController(ProjectAssignmentService projectAssignmentService) {
        this.projectAssignmentService = projectAssignmentService;
    }

    @PostMapping("/{projectId}/assign")
    public ProjectAssignmentEntity assignProject(
            @PathVariable UUID projectId,
            @RequestParam UUID employeeId,
            @RequestParam String role,
    @RequestParam String employee_type
    ) {
        return projectAssignmentService.assignProjectToEmployee(projectId, employeeId, role,employee_type);
    }
    
    @GetMapping("/employee/{employeeId}")
    public List<ProjectAssignmentEntity> getProjectsByEmployee(@PathVariable UUID employeeId) {
        return projectAssignmentService.getProjectsByEmployeeId(employeeId);
    }


    @GetMapping("/assignments")
    public List<ProjectAssignmentDTO> getAllAssignments() {
        return projectAssignmentService.getAllAssignments();
    }
}
