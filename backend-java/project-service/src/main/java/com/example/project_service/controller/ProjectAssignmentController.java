//package com.example.project_service.controller;
//
//import com.example.project_service.model.ProjectAssignmentEntity;
//import com.example.project_service.service.ProjectAssignmentService;
//import com.example.project_service.dto.ProjectAssignmentDTO;
//import org.springframework.web.bind.annotation.*;
//import java.util.UUID;
//import java.util.List;
//
//@RestController
//@CrossOrigin(origins = "*")
//@RequestMapping("/api/projects")
//public class ProjectAssignmentController {
//
//    private final ProjectAssignmentService projectAssignmentService;
//
//    
//    public ProjectAssignmentController(ProjectAssignmentService projectAssignmentService) {
//        this.projectAssignmentService = projectAssignmentService;
//    }
//
//    @PostMapping("/{projectId}/assign")
//    public ProjectAssignmentEntity assignProject(
//            @PathVariable UUID projectId,
//            @RequestParam UUID employeeId,
//            @RequestParam String role,
//    @RequestParam String employee_type
//    ) {
//        return projectAssignmentService.assignProjectToEmployee(projectId, employeeId, role,employee_type);
//    }
//    
//    @GetMapping("/employee/{employeeId}")
//    public List<ProjectAssignmentEntity> getProjectsByEmployee(@PathVariable UUID employeeId) {
//        return projectAssignmentService.getProjectsByEmployeeId(employeeId);
//    }
//
//
//    @GetMapping("/assignments")
//    public List<ProjectAssignmentDTO> getAllAssignments() {
//        return projectAssignmentService.getAllAssignments();
//    }
//}


package com.example.project_service.controller;

import com.example.project_service.dto.ProjectAssignmentDTO;
import com.example.project_service.service.ProjectAssignmentService;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/projects")
public class ProjectAssignmentController {

    private final ProjectAssignmentService service;

    public ProjectAssignmentController(ProjectAssignmentService service) {
        this.service = service;
    }

    // ================= ASSIGN =================
    @PostMapping("/{projectId}/assign")
    public ResponseEntity<ProjectAssignmentDTO> assignProject(
            @PathVariable UUID projectId,
            @RequestParam String employeeId,
            @RequestParam String role,
            @RequestParam String employee_type
    ) {

        try {
            return ResponseEntity.ok(
                    service.assignProjectToEmployee(
                            projectId,
                            UUID.fromString(employeeId),
                            role,
                            employee_type
                    )
            );
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    // ================= ACTIVE PROJECTS =================
    @GetMapping("/employee/{employeeId}/active-projects")
    public ResponseEntity<List<ProjectAssignmentDTO>> getActiveProjects(
            @PathVariable UUID employeeId
    ) {
        return ResponseEntity.ok(
                service.getActiveProjectsForEmployee(employeeId)
        );
    }

    // ================= ADMIN =================
    @GetMapping("/assignments")
    public ResponseEntity<List<ProjectAssignmentDTO>> getAll() {
        return ResponseEntity.ok(service.getAllAssignments());
    }

    // ================= FINISH =================
    @PutMapping("/assignments/{projectId}/finish")
    public ResponseEntity<Void> finish(@PathVariable UUID projectId) {
        service.finishProjectByProjectId(projectId);
        return ResponseEntity.noContent().build();
    }
}

