package com.example.project_service.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "projects")
//@Data


public class Projects {


	@Id
    @GeneratedValue
    private UUID id; // Change from Long to UUID
	
    
    @Column(nullable = false)
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt = LocalDateTime.now();
    //private String status;
    // ✅ REQUIRED for COMPLETED check
    @Column(name = "status", nullable = false)
    private String status;
    
    @Column(name = "cost_estimated")
    private Double estimatedCost;


    public Double getEstimatedCost() {
		return estimatedCost;
	}
	public void setEstimatedCost(Double estimatedCost) {
		this.estimatedCost = estimatedCost;
	}

	public enum ProjectStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED
    }


//    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
//    private List<ProjectAssignmentEntity> assignments;
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }



	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LocalDateTime getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDateTime startDate) {
		this.startDate = startDate;
	}

	public LocalDateTime getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDateTime endDate) {
		this.endDate = endDate;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	
	


//	public List<ProjectAssignmentEntity> getAssignments() {
//		return assignments;
//	}
//
//	public void setAssignments(List<ProjectAssignmentEntity> assignments) {
//		this.assignments = assignments;
//	}
    
    
    
    


}
