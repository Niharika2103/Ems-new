package com.example.attendance_service.model;

import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.DynamicInsert;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AttendanceEntity {

	@Id
	@GeneratedValue
	@Column(columnDefinition = "uuid")
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "employee_id", referencedColumnName = "id", nullable = false)
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
	private UserEmployeeMasterEntity employee;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", referencedColumnName = "id", nullable = false)
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
	private ProjectEntity project;

	@Column(name = "date", nullable = false)
	private LocalDate date;


	@Column(name = "worked_hours", nullable = false)
	private Double workedHours = 0.0;

	@Column(name = "total_hours", nullable = false)
	private Double totalWorkedHours = 0.0;

	@Column(name = "weekly_status", nullable = false)
	private String status;
	
	@Column(name = "monthly_status", nullable = true)
	private String monthlyStatus;

	

	@Column(name = "leave_type")
	private String leaveType;

	@Column(name = "year", nullable = false)
	private Integer year;

	@Column(name = "gender", nullable = true)
	private String gender;


	@Column(nullable = false)
	private Integer el = 25;

	@Column(nullable = false)
	private Integer extraMilar = 2;

	@Column(nullable = false)
	private Integer sl = 10;

	@Column(name = "maternity_leave")
	private Integer maternityLeave = 0;

	@Column(name = "paternity_leave")
	private Integer paternityLeave = 0;
	
	@Column(name = "working_days")
	private Integer workingDays = 0;

	@Column(name = "work_from_home")
	private Integer workFromHome = 315;

	@Column(name = "optional_holidays")
	private Integer optionalHolidays = 2;
	
	@Column(name = "holidays")
	private Integer holidays = 10;
	

	public Integer getOptionalHolidays() {
		return optionalHolidays;
	}

	public void setOptionalHolidays(Integer optionalHolidays) {
		this.optionalHolidays = optionalHolidays;
	}

	public Integer getHolidays() {
		return holidays;
	}

	public void setHolidays(Integer holidays) {
		this.holidays = holidays;
	}

	public Integer getWorkingDays() {
		return workingDays;
	}

	public void setWorkingDays(Integer workingDays) {
		this.workingDays = workingDays;
	}

	public Integer getWorkFromHome() {
		return workFromHome;
	}

	public void setWorkFromHome(Integer workFromHome) {
		this.workFromHome = workFromHome;
	}

	public Integer getMaternityLeave() {
		return maternityLeave;
	}

	public void setMaternityLeave(Integer maternityLeave) {
		this.maternityLeave = maternityLeave;
	}

	public Integer getPaternityLeave() {
		return paternityLeave;
	}

	public void setPaternityLeave(Integer paternityLeave) {
		this.paternityLeave = paternityLeave;
	}

	public String getMonthlyStatus() {
		return monthlyStatus;
	}

	public void setMonthlyStatus(String monthlyStatus) {
		this.monthlyStatus = monthlyStatus;
	}

	public Integer getEl() {
	    return el;
	}

	public void setEl(Integer el) {
	    this.el = el;
	}

	public Integer getExtraMilar() {
	    return extraMilar;
	}

	public void setExtraMilar(Integer extraMilar) {
	    this.extraMilar = extraMilar;
	}

	public Integer getSl() {
	    return sl;
	}

	public void setSl(Integer sl) {
	    this.sl = sl;
	}


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

