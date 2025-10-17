package com.example.attendance_service.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;


import com.example.attendance_service.model.AttendanceEntity;
import com.example.attendance_service.model.ProjectEntity;
import com.example.attendance_service.model.UserEmployeeMasterEntity;
import com.example.attendance_service.repository.AttendanceRepository;
import com.example.attendance_service.repository.ProjectRepository;
import com.example.attendance_service.repository.UserEmployeeMasterRepository;
import com.example.attendance_service.requestdto.AttendanceRequestDTO;
import com.example.attendance_service.responsedto.AttendanceResponseDTO;

import jakarta.transaction.Transactional;

@Service
public class AttendanceService {

	private final AttendanceRepository attendanceRepository;
	private final ProjectRepository projectRepository;
	private final UserEmployeeMasterRepository userRepository;

	public AttendanceService(AttendanceRepository attendanceRepository,
			ProjectRepository projectRepository,
			UserEmployeeMasterRepository userRepository) {
		this.attendanceRepository = attendanceRepository;
		this.projectRepository = projectRepository;
		this.userRepository = userRepository;
	}
// 	@Transactional
// 	public String savedWeeklyAttendance(UUID employeeId, UUID projectId, List<AttendanceRequestDTO> attendanceList) {

// 		// Step 1: Validate employee and project
// 		UserEmployeeMasterEntity employee = userRepository.findById(employeeId)
// 				.orElseThrow(() -> new RuntimeException("Employee not found"));
// 		ProjectEntity project = projectRepository.findById(projectId)
// 				.orElseThrow(() -> new RuntimeException("Project not found"));

// 		// Step 2: Get last saved attendance record for carry-forward
// 		AttendanceEntity latest = attendanceRepository
// 				.findTopByEmployee_IdOrderByDateDesc(employeeId)
// 				.orElse(null);

// 		double sl = (latest != null && latest.getSl() != null) ? latest.getSl() : 10.0;
// 		double el = (latest != null && latest.getEl() != null) ? latest.getEl() : 25.0;
// 		double extraMilar = (latest != null && latest.getExtraMilar() != null) ? latest.getExtraMilar() : 2.0;

// 		// ✅ Step 3: Initialize cumulative total worked hours
// 		double cumulativeTotal = 0.0;
// 		// Step 4: Sort dates sequentially
// 		attendanceList.sort(Comparator.comparing(AttendanceRequestDTO::getDate));

// 		// Step 5: Process each attendance record
// 		for (AttendanceRequestDTO dto : attendanceList) {
// 			LocalDate date = dto.getDate();
// 			double workedHours = (dto.getWorkedHours() == null) ? 0.0 : dto.getWorkedHours();
// 			String leaveType = (dto.getLeaveType() != null) ? dto.getLeaveType().trim().toLowerCase() : "";

// 			// Skip already existing date
// 			boolean exists = attendanceRepository.existsByEmployee_IdAndDate(employeeId, date);
// 			if (exists) {

// 				continue;
// 			}

// 			// Step 6: Handle leave deduction
// 			double leaveFraction = 0.0;
// 			if (workedHours <= 0.0) {
// 				leaveFraction = 1.0;
// 			} else if (workedHours < 8.0) {
// 				leaveFraction = (8.0 - workedHours) / 8.0;
// 			}

// 			if (!leaveType.isEmpty() && leaveFraction > 0) {
// 				switch (leaveType) {
// 				case "sl":
// 					if (sl >= leaveFraction) {
// 						sl -= leaveFraction;
// 						System.out.printf("🟡 Deducted %.2f SL on %s → remaining %.2f%n", leaveFraction, date, sl);
// 					} else {
// 						throw new RuntimeException("Insufficient Sick Leave balance!");
// 					}
// 					break;

// 				case "el":
// 					if (el >= leaveFraction) {
// 						el -= leaveFraction;
// 						System.out.printf("🔵 Deducted %.2f EL on %s → remaining %.2f%n", leaveFraction, date, el);
// 					} else {
// 						throw new RuntimeException("Insufficient Earned Leave balance!");
// 					}
// 					break;

// 				case "optional":
// 					if (extraMilar >= leaveFraction) {
// 						extraMilar -= leaveFraction;

// 					} else {
// 						throw new RuntimeException("Insufficient Optional Leave balance!");
// 					}
// 					break;
// 				default:

// 					break;
// 				}
// 			}

// 			// ✅ Step 7: Calculate cumulative total hours
// 			// If it’s a working day, add workedHours to total
// 			if (leaveType.isEmpty()) {
// 				cumulativeTotal += workedHours;
// 			}

// 			// Step 8: Save record
// 			AttendanceEntity entity = new AttendanceEntity();
// 			entity.setEmployee(employee);
// 			entity.setProject(project);
// 			entity.setDate(date);
// 			entity.setWorkedHours(workedHours);
// 			entity.setLeaveType(leaveType);
// 			entity.setYear(date.getYear());
// 			entity.setGender(employee.getGender());
// 			entity.setStatus("draft");

// 			// ✅ Save running total worked hours
// 			entity.setTotalWorkedHours(cumulativeTotal);

// 			// Store updated balances
// 			entity.setSl(sl);
// 			entity.setEl(el);
// 			entity.setExtraMilar(extraMilar);

// 			attendanceRepository.save(entity);
// 		}


// 		return "✅ Weekly attendance saved successfully";
// 	}



// 	public List<AttendanceResponseDTO> getAllAttendance() {
// 		List<AttendanceEntity> entities = attendanceRepository.findAllByOrderByDateAsc();

// 		return entities.stream()
// 				.map(a -> new AttendanceResponseDTO(
// 						a.getId(),
// 						a.getDate(),
// 						a.getWorkedHours(),
// 						a.getTotalWorkedHours(),
// 						a.getStatus(),
// 						a.getLeaveType(),
// 						a.getYear(),
// 						a.getGender(),

// 						// Employee details
// 						a.getEmployee() != null ? a.getEmployee().getId() : null,
// 								a.getEmployee() != null ? a.getEmployee().getEmployeeName() : null,
// 										a.getEmployee() != null ? a.getEmployee().getGender() : null,

// 												// Project details
// 												a.getProject() != null ? a.getProject().getId() : null,
// 														a.getProject() != null ? a.getProject().getProjectName() : null
// 						))
// 				.collect(Collectors.toList());
// 	}


// 	// // ✅ Get by employee
// 	// public List<AttendanceEntity> getAttendanceByEmployee(UUID employeeId) {
// 	// 	return attendanceRepository.findByEmployee_IdOrderByDateAsc(employeeId);
// 	// }

// 	// ✅ Get by project
// 	public List<AttendanceEntity> getAttendanceByProject(UUID projectId) {
// 		return attendanceRepository.findByProject_IdOrderByDateAsc(projectId);
// 	}

// 	// ✅ Get by both employee + project
// 	public List<AttendanceEntity> getAttendanceByEmployeeAndProject(UUID employeeId, UUID projectId) {
// 		return attendanceRepository.findByEmployee_IdAndProject_IdOrderByDateAsc(employeeId, projectId);
// 	}
//      @Transactional
// public String releaseMonthlyAttendance(UUID employeeId, UUID projectId, List<AttendanceEntity> attendanceList) {

// boolean value=attendanceRepository.existsById(employeeId);
// AttendanceEntity attendance=new AttendanceEntity();
// if(value==true) {
// attendance.setMonthlyStatus("Pending_Approval");
// }
// return "Weekly attendance submitted for approval.";
// }
// @Transactional
// public String savedWeeklyAttendance(UUID employeeId, UUID projectId, List<AttendanceEntity> attendanceList) {

// UserEmployeeMasterEntity employee = userRepository.findById(employeeId)
// .orElseThrow(() -> new RuntimeException("Employee not found"));
// ProjectEntity project = projectRepository.findById(projectId)
// .orElseThrow(() -> new RuntimeException("Project not found"));

// double cumulativeTotal = 0.0;

// attendanceList.sort((a, b) -> a.getDate().compareTo(b.getDate()));

// for (AttendanceEntity record : attendanceList) {

// record.setEmployee(employee);
// record.setProject(project);

// record.setGender(employee.getGender());


// if (record.getDate() == null) {
// record.setDate(LocalDate._now_());
// }

// // Normalize leave type
// String leaveType = record.getLeaveType();
// if (leaveType == null || leaveType.trim().isEmpty() || leaveType.equalsIgnoreCase("null")) {
// record.setLeaveType(null);
// }

// // Force non-null workedHours
// if (record.getWorkedHours() == null) {
// record.setWorkedHours(0.0);
// }
// // ✅ Ensure date is set
// if (record.getDate() == null) {
// record.setDate(LocalDate._now_());
// }

// // ✅ Always set year from date (system year if date = now)
// record.setYear(record.getDate().getYear());

// // ✅ Default worked hours
// if (record.getWorkedHours() == null) {
// record.setWorkedHours(0.0);
// }


// // Force non-null totalWorkedHours
// if (record.getTotalWorkedHours() == null) {
// record.setTotalWorkedHours(0.0);
// }

// // Leave logic: If leave day → workedHours = 0.0
// if (record.getLeaveType() != null) {
// record.setWorkedHours(0.0);
// }

// // Cumulative total (only add for working days)
// if (record.getLeaveType() == null) {
// cumulativeTotal += record.getWorkedHours();
// }

// record.setTotalWorkedHours(cumulativeTotal);
// record.setStatus("draft");
// }

// attendanceRepository.saveAll(attendanceList);
// return "Weekly attendance saved";
// }

@Transactional
public String releaseMonthlyAttendance(UUID employeeId, UUID projectId, List<AttendanceEntity> attendanceList) {
 
boolean value=attendanceRepository.existsById(employeeId);
AttendanceEntity attendance=new AttendanceEntity();
if(value==true) {
attendance.setMonthlyStatus("Pending_Approval");
}
return "Weekly attendance submitted for approval.";
}
@Transactional
public String savedWeeklyAttendance(UUID employeeId, UUID projectId, List<AttendanceEntity> attendanceList) {
 
UserEmployeeMasterEntity employee = userRepository.findById(employeeId)
.orElseThrow(() -> new RuntimeException("Employee not found"));
ProjectEntity project = projectRepository.findById(projectId)
.orElseThrow(() -> new RuntimeException("Project not found"));
 
double cumulativeTotal = 0.0;
 
attendanceList.sort((a, b) -> a.getDate().compareTo(b.getDate()));
 
for (AttendanceEntity record : attendanceList) {
 
record.setEmployee(employee);
record.setProject(project);
 
record.setGender(employee.getGender());
 
 
if (record.getDate() == null) {
record.setDate(LocalDate.now());
}
 
// Normalize leave type
String leaveType = record.getLeaveType();
if (leaveType == null || leaveType.trim().isEmpty() || leaveType.equalsIgnoreCase("null")) {
record.setLeaveType(null);
}
 
// Force non-null workedHours
if (record.getWorkedHours() == null) {
record.setWorkedHours(0.0);
}
// ✅ Ensure date is set
if (record.getDate() == null) {
record.setDate(LocalDate.now());
}
 
// ✅ Always set year from date (system year if date = now)
record.setYear(record.getDate().getYear());
 
// ✅ Default worked hours
if (record.getWorkedHours() == null) {
record.setWorkedHours(0.0);
}
 
 
// Force non-null totalWorkedHours
if (record.getTotalWorkedHours() == null) {
record.setTotalWorkedHours(0.0);
}
 
// Leave logic: If leave day → workedHours = 0.0
if (record.getLeaveType() != null) {
record.setWorkedHours(0.0);
}
 
// Cumulative total (only add for working days)
if (record.getLeaveType() == null) {
cumulativeTotal += record.getWorkedHours();
}
 
record.setTotalWorkedHours(cumulativeTotal);
record.setStatus("draft");
}
 
attendanceRepository.saveAll(attendanceList);
return "Weekly attendance saved";
}

}
