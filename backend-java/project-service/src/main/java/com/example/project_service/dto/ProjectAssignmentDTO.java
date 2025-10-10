package com.example.project_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ProjectAssignmentDTO {

    private UUID projectId;
    private String projectName;
    private String projectDescription;
    private UUID employeeId;
    private String employeeName;
    private String role;
    private LocalDateTime assignedAt;

    // Constructor
    public ProjectAssignmentDTO(UUID projectId, String projectName, String projectDescription,
                                UUID employeeId, String employeeName, String role, LocalDateTime assignedAt) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.projectDescription = projectDescription;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.role = role;
        this.assignedAt = assignedAt;
    }

    // Getters and setters
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getProjectDescription() { return projectDescription; }
    public void setProjectDescription(String projectDescription) { this.projectDescription = projectDescription; }

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
}
