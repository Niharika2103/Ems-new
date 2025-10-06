package com.example.project_service.controller;

import com.example.project_service.model.ProjectAssignmentEntity;
import com.example.project_service.service.ProjectAssignmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignments")
public class ProjectAssignmentController {

    private final ProjectAssignmentService assignmentService;

    public ProjectAssignmentController(ProjectAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    public ProjectAssignmentEntity assignEmployee(@RequestBody ProjectAssignmentEntity assignment) {
        return assignmentService.assignEmployee(assignment);
    }

    @GetMapping("/employee/{employeeId}")
    public List<ProjectAssignmentEntity> getAssignmentsByEmployee(@PathVariable Long employeeId) {
        return assignmentService.getAssignmentsByEmployee(employeeId);
    }

    @GetMapping("/project/{projectId}")
    public List<ProjectAssignmentEntity> getAssignmentsByProject(@PathVariable Long projectId) {
        return assignmentService.getAssignmentsByProject(projectId);
    }
}

