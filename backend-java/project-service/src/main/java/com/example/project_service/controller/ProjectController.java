//package com.example.project_service.controller;
//import com.example.project_service.model.Projects;
//import com.example.project_service.repository.ProjectRepository;
//import com.example.project_service.model.Projects;
//import com.example.project_service.service.ProjectService;
//import org.springframework.http.ResponseEntity;
//import org.springframework.http.converter.HttpMessageNotReadableException;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.UUID;
//@CrossOrigin(origins = "*")
//@RestController
//@RequestMapping("/api/projects")
//public class ProjectController {
//
//    private final ProjectService projectService;
//
//    public ProjectController(ProjectService projectService) {
//        this.projectService = projectService;
//    }
//
//
//
//    @PostMapping
//    public ResponseEntity<Projects> createProject(@RequestBody Projects project) {
//        if (project.getName() == null || project.getName().isEmpty()) {
//            return ResponseEntity.badRequest().body(null);
//        }
//      
//        Projects savedProject = projectService.createProject(project);
//        return ResponseEntity.ok(savedProject);
//    }
//
//
//    @GetMapping
//    public List<Projects> getAllProjects() {
//        return projectService.getAllProjects();
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Projects> getProjectById(@PathVariable UUID id) {
//        return projectService.getProjectById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
//        projectService.deleteProject(id);
//        return ResponseEntity.noContent().build();
//    }
//    @ControllerAdvice
//    public class GlobalExceptionHandler {
//
//        @ExceptionHandler(HttpMessageNotReadableException.class)
//        public ResponseEntity<String> handleJsonParseError(HttpMessageNotReadableException ex) {
//            return ResponseEntity.badRequest()
//                .body("Invalid JSON: " + ex.getMostSpecificCause().getMessage());
//        }
//    }
//
//    
//}

package com.example.project_service.controller;

import com.example.project_service.model.Projects;
import com.example.project_service.service.ProjectService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private static final Logger log =
            LoggerFactory.getLogger(ProjectController.class);

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
        log.info("ProjectController initialized");
    }

    @PostMapping
    public ResponseEntity<Projects> createProject(@RequestBody Projects project) {

        log.info("Received request to create project");

        if (project.getName() == null || project.getName().isEmpty()) {
            log.warn("Project creation failed: Project name is null or empty");
            return ResponseEntity.badRequest().body(null);
        }

        Projects savedProject = projectService.createProject(project);

        log.info("Project created successfully with ID: {}", savedProject.getId());
        return ResponseEntity.ok(savedProject);
    }

    @GetMapping
    public List<Projects> getAllProjects() {
        log.info("Fetching all projects");
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Projects> getProjectById(@PathVariable UUID id) {

        log.info("Fetching project with ID: {}", id);

        return projectService.getProjectById(id)
                .map(project -> {
                    log.info("Project found with ID: {}", id);
                    return ResponseEntity.ok(project);
                })
                .orElseGet(() -> {
                    log.warn("Project not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {

        log.info("Deleting project with ID: {}", id);

        projectService.deleteProject(id);

        log.info("Project deleted successfully with ID: {}", id);
        return ResponseEntity.noContent().build();
    }

    @ControllerAdvice
    public class GlobalExceptionHandler {

        private static final Logger log =
                LoggerFactory.getLogger(GlobalExceptionHandler.class);

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<String> handleJsonParseError(HttpMessageNotReadableException ex) {

            log.error("Invalid JSON received", ex);

            return ResponseEntity.badRequest()
                    .body("Invalid JSON: " + ex.getMostSpecificCause().getMessage());
        }
    }
}

