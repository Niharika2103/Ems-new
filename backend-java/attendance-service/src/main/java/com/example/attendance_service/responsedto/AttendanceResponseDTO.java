package com.example.attendance_service.responsedto;

import java.time.LocalDate;
import java.util.UUID;

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

    // --- Employee fields ---
    private UUID employeeId;
    private String employeeName;
    private String employeeGender;

    // --- Project fields ---
    private UUID projectId;
    private String projectName;

    // ✅ Custom parameterized constructor used by stream mapping
    public AttendanceResponseDTO(UUID id, LocalDate date, Double workedHours, Double totalWorkedHours,
                                 String status, String leaveType, Integer year, String gender,
                                 UUID employeeId, String employeeName, String employeeGender,
                                 UUID projectId, String projectName, Integer el,
                                 Integer sl, Integer extraMilar, Integer workFromHome, Integer paternityLeave,
                                 Integer maternityLeave, Integer remainingLeaves) {
        this.id = id;
        this.date = date;
        this.workedHours = workedHours;
        this.totalWorkedHours = totalWorkedHours;
        this.status = status;
        this.leaveType = leaveType;
        this.year = year;
        this.gender = gender;
        this.employeeId = employeeId;
        this.setEmployeeName(employeeName);
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

	public String getEmployeeName() {
		return employeeName;
	}

	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
	}
}