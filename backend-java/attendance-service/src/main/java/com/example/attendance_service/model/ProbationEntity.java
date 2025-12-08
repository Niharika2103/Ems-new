package com.example.attendance_service.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "probation")
public class ProbationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "probationid")
    private UUID probationId;

    // ---- FK COLUMN ----
    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    // ---- USER RELATION ----
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "employee_id",     // FK column in probation table
            referencedColumnName = "id",
            insertable = false,       // do not override FK
            updatable = false
    )
    private UserEmployeeMasterEntity user;

    @Column(name = "startdate", nullable = false)
    private LocalDate startDate;

    @Column(name = "enddate", nullable = false)
    private LocalDate endDate;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "manager", length = 150)
    private String manager;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "createdat", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat")
    private LocalDateTime updatedAt;

    // ---- Constructors ----
    public ProbationEntity() {}

    public ProbationEntity(UUID employeeId, LocalDate startDate, LocalDate endDate, String status) {
        this.employeeId = employeeId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    // ---- Getters & Setters ----

    public UUID getProbationId() {
        return probationId;
    }

    public void setProbationId(UUID probationId) {
        this.probationId = probationId;
    }

    public UUID getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(UUID employeeId) {
        this.employeeId = employeeId;
    }

    public UserEmployeeMasterEntity getUser() {
        return user;
    }

    public void setUser(UserEmployeeMasterEntity user) {
        this.user = user;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getManager() {
        return manager;
    }

    public void setManager(String manager) {
        this.manager = manager;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // ---- equals & hashCode ----

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProbationEntity)) return false;
        ProbationEntity that = (ProbationEntity) o;
        return Objects.equals(probationId, that.probationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(probationId);
    }
}
