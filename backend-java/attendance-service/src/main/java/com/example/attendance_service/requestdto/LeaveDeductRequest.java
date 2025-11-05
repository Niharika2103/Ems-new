package com.example.attendance_service.requestdto;

import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveDeductRequest {
    private UUID employeeId;
    private LocalDate from;
    private LocalDate to;
	public UUID getEmployeeId() {
		return employeeId;
	}
	public void setEmployeeId(UUID employeeId) {
		this.employeeId = employeeId;
	}
	public LocalDate getFrom() {
		return from;
	}
	public void setFrom(LocalDate from) {
		this.from = from;
	}
	public LocalDate getTo() {
		return to;
	}
	public void setTo(LocalDate to) {
		this.to = to;
	}
}
