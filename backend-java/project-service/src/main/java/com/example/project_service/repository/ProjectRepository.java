package com.example.project_service.repository;

import com.example.project_service.model.Projects;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Projects, UUID> {
}
