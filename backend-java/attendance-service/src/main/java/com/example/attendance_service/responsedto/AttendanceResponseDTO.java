
package com.example.attendance_service.responsedto;

import java.time.LocalDate;
import java.util.UUID;

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
    
 // --- Leave balance fields (from AttendanceEntity) ---
    private Integer el;
    private Integer sl;
    private Integer extraMilar;
    private Integer workFromHome;
    private Integer paternityLeave;
    private Integer maternityLeave;
    private Integer remainingLeaves;

    public Integer getEl() {
		return el;
	}

	public void setEl(Integer el) {
		this.el = el;
	}

	public Integer getSl() {
		return sl;
	}

	public void setSl(Integer sl) {
		this.sl = sl;
	}

	public Integer getExtraMilar() {
		return extraMilar;
	}

	public void setExtraMilar(Integer extraMilar) {
		this.extraMilar = extraMilar;
	}

	public Integer getWorkFromHome() {
		return workFromHome;
	}

	public void setWorkFromHome(Integer workFromHome) {
		this.workFromHome = workFromHome;
	}

	public Integer getPaternityLeave() {
		return paternityLeave;
	}

	public void setPaternityLeave(Integer paternityLeave) {
		this.paternityLeave = paternityLeave;
	}

	public Integer getMaternityLeave() {
		return maternityLeave;
	}

	public void setMaternityLeave(Integer maternityLeave) {
		this.maternityLeave = maternityLeave;
	}

	public Integer getRemainingLeaves() {
		return remainingLeaves;
	}

	public void setRemainingLeaves(Integer remainingLeaves) {
		this.remainingLeaves = remainingLeaves;
	}

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

    // ✅ Custom parameterized constructor used by stream mapping
    public AttendanceResponseDTO(UUID id, LocalDate date, Double workedHours, Double totalWorkedHours,
                                 String status, String leaveType, Integer year, String gender,
                                 UUID employeeId, String employeeName, String employeeGender,
                                 UUID projectId, String projectName, Integer el,
                                 Integer sl,Integer extraMilar,Integer workFromHome, Integer paternityLeave,
                                 Integer maternityLeave,Integer remainingLeaves) {
        this.id = id;
        this.date = date;
        this.workedHours = workedHours;
        this.totalWorkedHours = totalWorkedHours;
        this.status = status;
        this.leaveType = leaveType;
        this.year = year;
        this.gender = gender;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.employeeGender = employeeGender;
        this.projectId = projectId;
        this.projectName = projectName;
        this.el = el;
        this.sl = sl;
        this.extraMilar = extraMilar;
        this.workFromHome = workFromHome;
        this.paternityLeave = paternityLeave;
        this.maternityLeave = maternityLeave;
        this.remainingLeaves = remainingLeaves;
    }
}
