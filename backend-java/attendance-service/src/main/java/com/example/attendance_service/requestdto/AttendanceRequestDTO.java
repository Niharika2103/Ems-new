package com.example.attendance_service.requestdto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRequestDTO {
	
	private LocalDate date;
    private Double workedHours;
    private String leaveType;
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


}
