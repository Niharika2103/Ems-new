package com.example.project_service.repository;

import com.example.project_service.model.ProjectsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<ProjectsEntity, Long> {
}
