package com.example.project_service.service;

import com.example.project_service.model.ProjectsEntity;
import com.example.project_service.model.ProjectsEntity;
import com.example.project_service.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public ProjectsEntity createProject(ProjectsEntity project) {
        return projectRepository.save(project);
    }

    public List<ProjectsEntity> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<ProjectsEntity> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
}

