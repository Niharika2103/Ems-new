package com.example.attendance_service.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.attendance_service.model.ProjectEntity;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, UUID> {
}
