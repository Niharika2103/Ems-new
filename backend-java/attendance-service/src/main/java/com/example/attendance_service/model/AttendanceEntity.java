package com.example.attendance_service.model;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "attendance")
public class AttendanceEntity {

	@Id
	@GeneratedValue
	@Column(columnDefinition = "uuid")
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "employee_id", referencedColumnName = "id", nullable = false)
	private UserEmployeeMasterEntity employee;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", referencedColumnName = "id", nullable = false)
	private ProjectEntity project;

	@Column(name = "date", nullable = false)
	private LocalDate date;


	@Column(name = "worked_hours", nullable = false)
	private Double workedHours = 0.0;

	@Column(name = "total_hours", nullable = false)
	private Double totalWorkedHours = 0.0;

	@Column(name = "weekly_status", nullable = false)
	private String status;

	@Column(name = "leave_type")
	private String leaveType;

	@Column(name = "year", nullable = false)
    private Integer year;
	
	@Column(name = "gender", nullable = true)
    private String gender;
	
	

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public Integer getYear() {
		return year;
	}

	public void setYear(Integer year) {
		this.year = year;
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public UserEmployeeMasterEntity getEmployee() {
		return employee;
	}

	public void setEmployee(UserEmployeeMasterEntity employee) {
		this.employee = employee;
	}

	public ProjectEntity getProject() {
		return project;
	}

	public void setProject(ProjectEntity project) {
		this.project = project;
	}

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public Double getWorkedHours() {
		return workedHours;
	}

	public void setWorkedHours(Double workedHours) {
		this.workedHours = workedHours;
	}

	public String getLeaveType() {
		return leaveType;
	}

	public void setLeaveType(String leaveType) {
		this.leaveType = leaveType;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Double getTotalWorkedHours() {
		return totalWorkedHours;
	}

	public void setTotalWorkedHours(Double totalWorkedHours) {
		this.totalWorkedHours = totalWorkedHours;
	}



}

