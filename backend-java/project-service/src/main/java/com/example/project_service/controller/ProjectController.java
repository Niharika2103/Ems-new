package com.example.project_service.controller;
import com.example.project_service.model.Projects;
import com.example.project_service.repository.ProjectRepository;
import com.example.project_service.model.Projects;
import com.example.project_service.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }



    @PostMapping
    public ResponseEntity<Projects> createProject(@RequestBody Projects project) {
        if (project.getName() == null || project.getName().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }
        System.out.println("@34::"+project.getStatus());
        Projects savedProject = projectService.createProject(project);
        return ResponseEntity.ok(savedProject);
    }


    @GetMapping
    public List<Projects> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Projects> getProjectById(@PathVariable UUID id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
    @ControllerAdvice
    public class GlobalExceptionHandler {

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<String> handleJsonParseError(HttpMessageNotReadableException ex) {
            return ResponseEntity.badRequest()
                .body("Invalid JSON: " + ex.getMostSpecificCause().getMessage());
        }
    }

    
}
