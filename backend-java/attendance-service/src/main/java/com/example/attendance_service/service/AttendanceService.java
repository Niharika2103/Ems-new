package com.example.attendance_service.service;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import java.util.Map;
import java.util.Collections;
import java.util.stream.Collectors;
import java.time.temporal.TemporalAdjusters;

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

	public List<AttendanceResponseDTO> getAllAttendance() {
		List<AttendanceEntity> entities = attendanceRepository.findAllByOrderByDateAsc();

		return entities.stream()
				.map(a -> new AttendanceResponseDTO(
						a.getId(),
						a.getDate(),
						a.getWorkedHours(),
						a.getTotalWorkedHours(),
						a.getStatus(),
						a.getLeaveType(),
						a.getYear(),
						a.getGender(),

						// Employee details
						a.getEmployee() != null ? a.getEmployee().getId() : null,
						a.getEmployee() != null ? a.getEmployee().getEmployeeName() : null,
						a.getEmployee() != null ? a.getEmployee().getGender() : null,

						// Project details
						a.getProject() != null ? a.getProject().getId() : null,
						a.getProject() != null ? a.getProject().getProjectName() : null))
				.collect(Collectors.toList());
	}

	
	@Transactional
public List<AttendanceEntity> saveOrUpdateAttendance(
        UUID employeeId, UUID projectId, List<AttendanceRequestDTO> attendanceList) {

    if (employeeId == null || projectId == null) {
        return Collections.emptyList();
    }

    if (!attendanceRepository.existsByEmployee_IdAndProjectIsNull(employeeId)) {
        UserEmployeeMasterEntity employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        AttendanceEntity firstTimeRecord = new AttendanceEntity();
        firstTimeRecord.setEmployee(employee);
        firstTimeRecord.setProject(null); // project_id = NULL
        firstTimeRecord.setDate(LocalDate.now());
        firstTimeRecord.setYear(LocalDate.now().getYear());
        firstTimeRecord.setGender(employee.getGender());
        firstTimeRecord.setWorkedHours(0.0);
        firstTimeRecord.setTotalWorkedHours(0.0);
        firstTimeRecord.setStatus("draft");
        firstTimeRecord.setMonthlyStatus("draft");

        // ✅ EXACT DEFAULT VALUES FROM YOUR INSERT STATEMENT
        firstTimeRecord.setWorkingDays(0);
        firstTimeRecord.setWorkFromHome(315);
        firstTimeRecord.setHolidays(10);
        firstTimeRecord.setOptionalHolidays(2);
        firstTimeRecord.setEl(25);
        firstTimeRecord.setSl(10);
        firstTimeRecord.setExtraMilar(2);
        firstTimeRecord.setMaternityLeave(0);
        firstTimeRecord.setPaternityLeave(0);

        attendanceRepository.save(firstTimeRecord);
    }

    UserEmployeeMasterEntity employee = userRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
    ProjectEntity project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));

    double cumulativeTotal = 0.0;
    List<AttendanceEntity> allRecords = new ArrayList<>();

    if (attendanceList != null && !attendanceList.isEmpty()) {
        // Sort by date so cumulative calculation works properly
        attendanceList.sort(Comparator.comparing(AttendanceRequestDTO::getDate));

        for (AttendanceRequestDTO dto : attendanceList) {
            LocalDate date = dto.getDate();
            if (date == null) continue;

            // ✅ Find if record exists for that exact date
            AttendanceEntity existing = attendanceRepository
                    .findByEmployee_IdAndProject_IdAndDate(employeeId, projectId, date)
                    .orElse(null);

            if (existing == null) {
                // ✅ Create new record
                existing = new AttendanceEntity();
                existing.setEmployee(employee);
                existing.setProject(project);
                existing.setGender(employee.getGender());
                existing.setDate(date);
                existing.setYear(date.getYear());
                

                // ✅ SET WEEKLY RECORD DEFAULTS (NOT org-level defaults!)
                existing.setWorkingDays(0);
                existing.setWorkFromHome(0);          // ← 0, not 315
                existing.setHolidays(0);              // ← 0, not 10
                existing.setOptionalHolidays(0);      // ← 0, not 2
                existing.setEl(0);
                existing.setSl(0);
                existing.setExtraMilar(0);
                existing.setMaternityLeave(0);
                existing.setPaternityLeave(0);
            }

            // ✅ Update leave type and worked hours properly
            existing.setLeaveType(dto.getLeaveType());

            // If leaveType is empty or null → use workedHours from DTO
            // Else (e.g., CL, SL, etc.) → set workedHours = 0
            if (dto.getLeaveType() == null || dto.getLeaveType().isEmpty()) {
                existing.setWorkedHours(dto.getWorkedHours() != null ? dto.getWorkedHours() : 0.0);
            } else {
                existing.setWorkedHours(0.0);
            }

            existing.setStatus("draft");
            existing.setMonthlyStatus("draft");

            // ✅ Cumulative total worked hours
            cumulativeTotal += existing.getWorkedHours();
            existing.setTotalWorkedHours(cumulativeTotal);

            attendanceRepository.save(existing);
            allRecords.add(existing);
        }
    }

    // ✅ Return all saved or updated records sorted by date
    return allRecords.stream()
            .sorted(Comparator.comparing(AttendanceEntity::getDate))
            .collect(Collectors.toList());
}



	// ✅ Optional: fetch for any week
public List<AttendanceEntity> getAttendanceForWeek(UUID employeeId, UUID projectId, LocalDate weekStart) {
    if (employeeId == null || projectId == null || weekStart == null) {
        return Collections.emptyList();
    }

    // ✅ Ensure Monday–Sunday week
    LocalDate startOfWeek = weekStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    LocalDate endOfWeek = weekStart.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

    return attendanceRepository.findByEmployee_IdAndProject_IdAndDateBetween(
            employeeId, projectId, startOfWeek, endOfWeek);
}

    
public List<AttendanceEntity> getAttendanceForMonthRange(UUID employeeId, LocalDate start, LocalDate end) {
    if (employeeId == null || start == null || end == null) {
        return Collections.emptyList();
    }

    return attendanceRepository.findByEmployee_IdAndDateBetween(employeeId, start, end);
}

@Transactional
public void releaseWeeklyAttendance(UUID employeeId, LocalDate weekStart, LocalDate weekEnd) {
    List<AttendanceEntity> attendanceList =
            attendanceRepository.findByEmployee_IdAndDateBetween(employeeId, weekStart, weekEnd);
   // Fetch all attendance records for this week
	List<AttendanceEntity> validRecords = attendanceList.stream()
            .filter(a -> a.getProject() != null)
            .collect(Collectors.toList());

    for (AttendanceEntity attendance : validRecords) {
        attendance.setStatus("Pending_approval");
    }
 
    
    // Save updates without touching monthlyStatus
    attendanceRepository.saveAll(validRecords);
}

@Transactional
public void releaseMonthlyAttendance(UUID employeeId, UUID projectId, LocalDate monthStart, LocalDate monthEnd) {
    // ✅ Fetch all attendance records for this employee + project + month
    List<AttendanceEntity> attendanceList =
            attendanceRepository.findByEmployee_IdAndProject_IdAndDateBetween(
                    employeeId, projectId, monthStart, monthEnd
            );

    System.out.println("@115: " + attendanceList);

    // ✅ Update monthly status safely
    for (AttendanceEntity attendance : attendanceList) {
        attendance.setMonthlyStatus("Pending_approval");
    }

    // ✅ Save back
    attendanceRepository.saveAll(attendanceList);
}



	// ✅ Get by employee
	public List<AttendanceEntity> getAttendanceByEmployee(UUID employeeId) {
		return attendanceRepository.findByEmployee_IdOrderByDateAsc(employeeId);
	}

	// ✅ Get by project
	public List<AttendanceEntity> getAttendanceByProject(UUID projectId) {
		return attendanceRepository.findByProject_IdOrderByDateAsc(projectId);
	}

	// ✅ Get by both employee + project
	public List<AttendanceEntity> getAttendanceByEmployeeAndProject(UUID employeeId, UUID projectId) {
		return attendanceRepository.findByEmployee_IdAndProject_IdOrderByDateAsc(employeeId, projectId);
	}

	public List<AttendanceResponseDTO> getMonthlyApprovalSummary(LocalDate startDate, LocalDate endDate) {
    // ✅ Fetch all attendance entries safely
    List<AttendanceEntity> allRecords = attendanceRepository.findAllByOrderByDateAsc();
    if (allRecords == null) allRecords = Collections.emptyList();

    // ✅ Filter by date range
    List<AttendanceEntity> recordsInRange = allRecords.stream()
        .filter(a -> a.getDate() != null && !a.getDate().isBefore(startDate) && !a.getDate().isAfter(endDate))
        .collect(Collectors.toList());

    // ✅ Group by employee safely
    Map<UUID, List<AttendanceEntity>> groupedByEmployee = recordsInRange.stream()
        .filter(a -> a.getEmployee() != null && a.getEmployee().getId() != null)
        .collect(Collectors.groupingBy(a -> a.getEmployee().getId()));

    // ✅ Map to response DTOs
    return groupedByEmployee.entrySet().stream()
        .map(entry -> {
            UUID employeeId = entry.getKey();
            List<AttendanceEntity> empRecords = entry.getValue();

            AttendanceEntity first = empRecords.stream().findFirst().orElse(null);

            String employeeName = null;
            String projectName = null;
            String gender = null;
            Integer year = null;
            UUID projectId = null;

            if (first != null) {
                if (first.getEmployee() != null) {
                    employeeName = first.getEmployee().getEmployeeName();
                    gender = first.getEmployee().getGender();
                }
                if (first.getProject() != null) {
                    projectName = first.getProject().getProjectName();
                    projectId = first.getProject().getId();
                }
                year = first.getYear();
            }

            return new AttendanceResponseDTO(
                null, null, null, null, null, null, 
                year, gender, employeeId, employeeName, 
                null, projectId, projectName
            );
        })
        .sorted(Comparator.comparing(
            AttendanceResponseDTO::getEmployeeName,
            Comparator.nullsLast(String::compareToIgnoreCase)
        ))
        .collect(Collectors.toList());
}

}
