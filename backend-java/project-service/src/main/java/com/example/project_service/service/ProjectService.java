//package com.example.project_service.service;
//
//import com.example.project_service.model.Projects;
//import com.example.project_service.model.Projects;
//import com.example.project_service.repository.ProjectRepository;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//@Service
//public class ProjectService {
//
//    private final ProjectRepository projectRepository;
//
//    public ProjectService(ProjectRepository projectRepository) {
//        this.projectRepository = projectRepository;
//    }
//
//    public Projects createProject(Projects project) {
//        return projectRepository.save(project);
//    }
//
//    public List<Projects> getAllProjects() {
//        return projectRepository.findAll();
//    }
//
//    public Optional<Projects> getProjectById(UUID id) {
//        return projectRepository.findById(id);
//    }
//
//    public void deleteProject(UUID id) {
//        projectRepository.deleteById(id);
//    }
//}
//

package com.example.project_service.service;

import com.example.project_service.model.Projects;
import com.example.project_service.repository.ProjectRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectService {

    private static final Logger log =
            LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
        log.info("ProjectService initialized");
    }

    public Projects createProject(Projects project) {

        log.info("Saving project: {}", project.getName());

        try {
            Projects savedProject = projectRepository.save(project);
            log.info("Project saved successfully with ID: {}", savedProject.getId());
            return savedProject;
        } catch (Exception e) {
            log.error("Error while saving project", e);
            throw e;
        }
    }

    public List<Projects> getAllProjects() {

        log.info("Fetching all projects");
        return projectRepository.findAll();
    }

    public Optional<Projects> getProjectById(UUID id) {

        log.info("Fetching project by ID: {}", id);
        return projectRepository.findById(id);
    }

    public void deleteProject(UUID id) {

        log.info("Deleting project with ID: {}", id);

        try {
            projectRepository.deleteById(id);
            log.info("Project deleted successfully with ID: {}", id);
        } catch (Exception e) {
            log.error("Error while deleting project with ID: {}", id, e);
            throw e;
        }
    }
}

