package com.example.project_service.service;

import com.example.project_service.model.Projects;
import com.example.project_service.model.Projects;
import com.example.project_service.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public Projects createProject(Projects project) {
        return projectRepository.save(project);
    }

    public List<Projects> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<Projects> getProjectById(UUID id) {
        return projectRepository.findById(id);
    }

    public void deleteProject(UUID id) {
        projectRepository.deleteById(id);
    }
}

