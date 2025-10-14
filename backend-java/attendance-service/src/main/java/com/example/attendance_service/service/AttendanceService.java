package com.example.attendance_service.service;

import java.time.LocalDate;
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

 // Saves weekly attendance records as draft.
    
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
    
 // Submits weekly attendance records for approval.
    @Transactional
    public String releaseWeeklyAttendance(UUID employeeId, UUID projectId, List<AttendanceEntity> attendanceList) {

        UserEmployeeMasterEntity employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        double cumulativeTotal = 0.0;

        // Sort attendance by date
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

            // Default worked hours
            if (record.getWorkedHours() == null) {
                record.setWorkedHours(0.0);
            }

            record.setYear(record.getDate().getYear());

            if (record.getTotalWorkedHours() == null) {
                record.setTotalWorkedHours(0.0);
            }

            // If leave day → worked hours = 0
            if (record.getLeaveType() != null) {
                record.setWorkedHours(0.0);
            }

            // Cumulative total for working days only
            if (record.getLeaveType() == null) {
                cumulativeTotal += record.getWorkedHours();
            }

            record.setTotalWorkedHours(cumulativeTotal);

            // ✅ Difference from saveAll:
            record.setStatus("pending_approval");
        }

        attendanceRepository.saveAll(attendanceList);
        return "Weekly attendance submitted for approval.";
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
                        a.getProject() != null ? a.getProject().getProjectName() : null
                ))
                .collect(Collectors.toList());
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
