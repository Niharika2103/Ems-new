package com.example.attendance_service.responsedto;

import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Flattened Attendance Response DTO combining:
 * - AttendanceEntity
 * - UserEmployeeMasterEntity (employee info)
 * - ProjectEntity (project info)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponseDTO {

    // --- Attendance fields ---
    private UUID id;
    private LocalDate date;
    private Double workedHours;
    private Double totalWorkedHours;
    private String status;
    private String leaveType;
    private Integer year;
    private String gender; // From attendance

    // --- Employee fields ---
    private UUID employeeId;
    private String employeeName;
    private String employeeGender;

    // --- Project fields ---
    private UUID projectId;
    private String projectName;

    
    
    
    public UUID getId() {
		return id;
	}




	public void setId(UUID id) {
		this.id = id;
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




	public Double getTotalWorkedHours() {
		return totalWorkedHours;
	}




	public void setTotalWorkedHours(Double totalWorkedHours) {
		this.totalWorkedHours = totalWorkedHours;
	}




	public String getStatus() {
		return status;
	}




	public void setStatus(String status) {
		this.status = status;
	}




	public String getLeaveType() {
		return leaveType;
	}




	public void setLeaveType(String leaveType) {
		this.leaveType = leaveType;
	}




	public Integer getYear() {
		return year;
	}




	public void setYear(Integer year) {
		this.year = year;
	}




	public String getGender() {
		return gender;
	}




	public void setGender(String gender) {
		this.gender = gender;
	}




	public UUID getEmployeeId() {
		return employeeId;
	}




	public void setEmployeeId(UUID employeeId) {
		this.employeeId = employeeId;
	}




	public String getEmployeeName() {
		return employeeName;
	}




	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
	}




	public String getEmployeeGender() {
		return employeeGender;
	}




	public void setEmployeeGender(String employeeGender) {
		this.employeeGender = employeeGender;
	}




	public UUID getProjectId() {
		return projectId;
	}




	public void setProjectId(UUID projectId) {
		this.projectId = projectId;
	}




	public String getProjectName() {
		return projectName;
	}




	public void setProjectName(String projectName) {
		this.projectName = projectName;
	}




	
    
}
