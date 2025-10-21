package com.example.attendance_service.service;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.Collections;
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

    LocalDate today = LocalDate.now();
    LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
    LocalDate endOfWeek = startOfWeek.plusDays(6);

    UserEmployeeMasterEntity employee = userRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
    ProjectEntity project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));

    double cumulativeTotal = 0.0;

    // 1️⃣ Fetch existing week data
    List<AttendanceEntity> currentWeek = attendanceRepository.findByEmployee_IdAndProject_IdAndDateBetween(
            employeeId, projectId, startOfWeek, endOfWeek);

    // 2️⃣ Create default records for missing days
    for (int i = 0; i < 7; i++) {
        LocalDate date = startOfWeek.plusDays(i);

        AttendanceEntity existing = currentWeek.stream()
                .filter(a -> a.getDate().equals(date))
                .findFirst()
                .orElse(null);

        if (existing == null) {
            AttendanceEntity newRecord = new AttendanceEntity();
            newRecord.setEmployee(employee);
            newRecord.setProject(project);
            newRecord.setGender(employee.getGender());
            newRecord.setDate(date);
            newRecord.setYear(date.getYear());
            newRecord.setWorkedHours(0.0);
            newRecord.setTotalWorkedHours(cumulativeTotal);
            newRecord.setStatus("draft");
            newRecord.setMonthlyStatus("draft");

            attendanceRepository.save(newRecord);
            currentWeek.add(newRecord);
        }
    }

    // 3️⃣ Update with user-provided attendanceList
    if (attendanceList != null) {
        // Sort so cumulative works correctly
        attendanceList.sort(Comparator.comparing(AttendanceRequestDTO::getDate));

        for (AttendanceRequestDTO dto : attendanceList) {
            LocalDate date = dto.getDate();
            if (date == null) continue;

            AttendanceEntity entity = currentWeek.stream()
                    .filter(a -> a.getDate().equals(date))
                    .findFirst()
                    .orElse(null);

            if (entity != null) {
                double workedHours = dto.getWorkedHours() != null ? dto.getWorkedHours() : 0.0;
                entity.setWorkedHours(dto.getLeaveType() != null && !dto.getLeaveType().isEmpty() ? 0.0 : workedHours);
                entity.setLeaveType(dto.getLeaveType());
                entity.setStatus("draft");

                cumulativeTotal += entity.getWorkedHours();
                entity.setTotalWorkedHours(cumulativeTotal);

                attendanceRepository.save(entity);
            }
        }
    }

    // 4️⃣ Return sorted current week
    return currentWeek.stream()
            .sorted(Comparator.comparing(AttendanceEntity::getDate))
            .collect(Collectors.toList());
}


// ✅ Always fetch current week attendance (after saving)
public List<AttendanceEntity> getAttendanceForCurrentWeek(UUID employeeId, UUID projectId) {
    if (employeeId == null || projectId == null) {
        return Collections.emptyList();
    }

    LocalDate today = LocalDate.now();
    LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
    LocalDate endOfWeek = startOfWeek.plusDays(6);

    return attendanceRepository.findByEmployee_IdAndProject_IdAndDateBetween(
            employeeId, projectId, startOfWeek, endOfWeek);
}

	// ✅ Optional: fetch for any week
	public List<AttendanceEntity> getAttendanceForWeek(UUID employeeId, UUID projectId, LocalDate weekStart) {
		if (employeeId == null || projectId == null || weekStart == null) {
			return Collections.emptyList();
		}

		LocalDate startOfWeek = weekStart.with(DayOfWeek.MONDAY);
		LocalDate endOfWeek = startOfWeek.plusDays(6);

		return attendanceRepository.findByEmployee_IdAndProject_IdAndDateBetween(
				employeeId, projectId, startOfWeek, endOfWeek);
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
}
