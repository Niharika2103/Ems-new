//package com.example.project_service.model;
//
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "project_assignments")
//public class ProjectAssignmentEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.AUTO)
//    @Column(columnDefinition = "UUID")
//    private UUID id;
//
//    @Column(name = "employee_id", nullable = false)
//    private UUID employeeId;
//
//    @Column(nullable = false)
//    private String role;
//
//
//    @Column(name = "employee_type", nullable = false)
//    private String employee_type;
//
//
//    @Column(name = "assigned_at", nullable = false)
//    private LocalDateTime assignedAt;
//
//    @ManyToOne
//    @JoinColumn(name = "project_id", nullable = false)
//    private Projects project;
//
//    // ✅ Getters and Setters
//    public UUID getId() { return id; }
//    public void setId(UUID id) { this.id = id; }
//
//    public UUID getEmployeeId() { return employeeId; }
//    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }
//
//    public String getRole() { return role; }
//    public void setRole(String role) { this.role = role; }
//
//    public String getEmployee_type() {
//        return employee_type;
//    }
//
//    public void setEmployee_type(String employee_type) {
//        this.employee_type = employee_type;
//    }
//
//    public LocalDateTime getAssignedAt() { return assignedAt; }
//    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
//
//    public Projects getProject() { return project; }
//    public void setProject(Projects project) { this.project = project; }
//}

package com.example.project_service.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_assignments")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProjectAssignmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(nullable = false)
    private String role;

    @Column(name = "employee_type", nullable = false)
    private String employee_type;

    @Column(name = "assigned_at", insertable = false, updatable = false)
    private LocalDateTime assignedAt;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Projects project;

    // ===== getters & setters =====

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmployee_type() { return employee_type; }
    public void setEmployee_type(String employee_type) { this.employee_type = employee_type; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public Projects getProject() { return project; }
    public void setProject(Projects project) { this.project = project; }
}
