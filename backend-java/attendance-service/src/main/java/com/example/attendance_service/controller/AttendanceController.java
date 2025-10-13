package com.example.attendance_service.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.attendance_service.model.AttendanceEntity;
import com.example.attendance_service.responsedto.AttendanceResponseDTO;
import com.example.attendance_service.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // ✅ POST weekly attendance
    @PostMapping("/saveall")
    public String saveallWeek(
            @RequestParam UUID employeeId,
            @RequestParam UUID projectId,
            @RequestBody List<AttendanceEntity> attendanceList) {
        return attendanceService.savedWeeklyAttendance(employeeId, projectId, attendanceList);
    }
    
 // ✅ POST weekly attendance release
    @PostMapping("/release-week")
    public String releaseWeek(
            @RequestParam UUID employeeId,
            @RequestParam UUID projectId,
            @RequestBody List<AttendanceEntity> attendanceList) {
        return attendanceService.releaseWeeklyAttendance(employeeId, projectId, attendanceList);
    }


    // ✅ GET all attendance
    @GetMapping
    public List<AttendanceResponseDTO> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    // ✅ GET attendance by employee
    @GetMapping("/employee/{employeeId}")
    public List<AttendanceEntity> getAttendanceByEmployee(@PathVariable UUID employeeId) {
        return attendanceService.getAttendanceByEmployee(employeeId);
    }

    // ✅ GET attendance by project
    @GetMapping("/project/{projectId}")
    public List<AttendanceEntity> getAttendanceByProject(@PathVariable UUID projectId) {
        return attendanceService.getAttendanceByProject(projectId);
    }

    // ✅ GET attendance by both employee + project
    @GetMapping("/employee/{employeeId}/project/{projectId}")
    public List<AttendanceEntity> getAttendanceByEmployeeAndProject(@PathVariable UUID employeeId, @PathVariable UUID projectId) {
        return attendanceService.getAttendanceByEmployeeAndProject(employeeId, projectId);
    }
}
