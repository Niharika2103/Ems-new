
package com.example.attendance_service.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.attendance_service.model.AttendanceEntity;
import com.example.attendance_service.requestdto.AttendanceRequestDTO;
import com.example.attendance_service.requestdto.LeaveDeductRequest;
import com.example.attendance_service.responsedto.AttendanceResponseDTO;
import com.example.attendance_service.service.AttendanceService;

import java.util.ArrayList;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private static final Logger log =
            LoggerFactory.getLogger(AttendanceController.class);

    @Value("${calendarific.api.key}")
    private String apiKey;

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // save and update current week
    @PostMapping("/attendance/saveall")
    public List<AttendanceEntity> saveAllWeek(
            @RequestParam UUID employeeId,
            @RequestParam UUID projectId,
            @RequestParam String employeename,
            @RequestBody(required = false)
            Optional<List<AttendanceRequestDTO>> attendanceListOpt) {

        log.info("Saving weekly attendance | employeeId={} | projectId={} | employeeName={}",
                employeeId, projectId, employeename);

        List<AttendanceRequestDTO> attendanceList =
                attendanceListOpt.orElseGet(ArrayList::new);

        return attendanceService.saveOrUpdateAttendance(
                employeeId, projectId, attendanceList, employeename);
    }

    @GetMapping("/attendance/week")
    public List<AttendanceEntity> getAttendanceForWeek(
            @RequestParam UUID employeeId,
            @RequestParam UUID projectId,
            @RequestParam String startDate) {

        LocalDate weekStart = LocalDate.parse(startDate.trim());

        log.debug("Fetching weekly attendance | employeeId={} | projectId={} | weekStart={}",
                employeeId, projectId, weekStart);

        return attendanceService.getAttendanceForWeek(
                employeeId, projectId, weekStart);
    }

    @GetMapping("/attendance/month/range")
    public List<AttendanceEntity> getAttendanceForMonthRange(
            @RequestParam UUID employeeId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        LocalDate start = LocalDate.parse(startDate.trim());
        LocalDate end = LocalDate.parse(endDate.trim());

        log.debug("Fetching monthly attendance | employeeId={} | start={} | end={}",
                employeeId, start, end);

        return attendanceService.getAttendanceForMonthRange(
                employeeId, start, end);
    }

    @PostMapping("/attendance/release-weekly")
    public ResponseEntity<String> releaseWeekly(
            @RequestParam UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekEnd,
            @RequestParam String employeeName) {

        log.info("Releasing weekly attendance | employeeId={} | from={} | to={}",
                employeeId, weekStart, weekEnd);

        attendanceService.releaseWeeklyAttendance(
                employeeId, weekStart, weekEnd, employeeName);

        return ResponseEntity.ok("Weekly attendance released successfully.");
    }

    @PostMapping("/attendance/release-monthly")
    public ResponseEntity<String> releaseMonth(
            @RequestParam UUID employeeId,
            @RequestParam UUID projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate monthStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate monthEnd,
            @RequestParam String employeeName) {

        log.info("Releasing monthly attendance | employeeId={} | projectId={} | from={} | to={}",
                employeeId, projectId, monthStart, monthEnd);

        attendanceService.releaseMonthlyAttendance(
                employeeId, projectId, monthStart, monthEnd, employeeName);

        return ResponseEntity.ok("Monthly attendance released successfully.");
    }

    @GetMapping("/attendance")
    public List<AttendanceResponseDTO> getAllAttendance() {
        log.debug("Fetching all attendance records");
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/attendance/employee/{employeeId}")
    public List<AttendanceEntity> getAttendanceByEmployee(
            @PathVariable UUID employeeId) {

        log.debug("Fetching attendance by employeeId={}", employeeId);
        return attendanceService.getAttendanceByEmployee(employeeId);
    }

    @GetMapping("/attendance/project/{projectId}")
    public List<AttendanceEntity> getAttendanceByProject(
            @PathVariable UUID projectId) {

        log.debug("Fetching attendance by projectId={}", projectId);
        return attendanceService.getAttendanceByProject(projectId);
    }

    @GetMapping("/attendance/employee/{employeeId}/project/{projectId}")
    public List<AttendanceEntity> getAttendanceByEmployeeAndProject(
            @PathVariable UUID employeeId,
            @PathVariable UUID projectId) {

        log.debug("Fetching attendance | employeeId={} | projectId={}",
                employeeId, projectId);

                  return attendanceService.getAttendanceByEmployeeAndProject(
                employeeId, projectId);
    }

     
     @GetMapping("/attendance/freelancer/approval-summary")
     public ResponseEntity<List<AttendanceResponseDTO>> getFreelancerApprovalSummary(
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
             @RequestParam(defaultValue = "monthly") String periodType) {

         List<AttendanceResponseDTO> result =
                 attendanceService.getFreelancerApprovalSummary(startDate, endDate, periodType);

         return ResponseEntity.ok(result);
     }

     
    
      

    @GetMapping("/attendance/approval-summary")
    public ResponseEntity<List<AttendanceResponseDTO>> getApprovalSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "monthly") String periodType) {

        log.info("Fetching approval summary | periodType={} | from={} | to={}",
                periodType, startDate, endDate);

        List<AttendanceResponseDTO> result =
                attendanceService.getApprovalSummary(
                        startDate, endDate, periodType);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/attendance/check-leave-eligibility")
    public ResponseEntity<Map<String, Object>> checkLeaveEligibility(
            @RequestParam UUID employeeId,
            @RequestParam String leaveType,
            @RequestParam(defaultValue = "1") int requestedDays) {

        log.info("Checking leave eligibility | employeeId={} | leaveType={} | days={}",
                employeeId, leaveType, requestedDays);

        boolean canApply =
                attendanceService.canApplyLeave(
                        employeeId, leaveType, requestedDays);

        Map<String, Object> response = new HashMap<>();
        response.put("leaveType", leaveType);
        response.put("requestedDays", requestedDays);
        response.put("canApply", canApply);

        if (canApply) {
            response.put("message", "You can apply for " + leaveType);
            return ResponseEntity.ok(response);
        } else {
            response.put("message",
                    "You have already used all available " + leaveType + " leaves.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/attendance/apply-default-leaves-on-approval")
    public ResponseEntity<String> applyDefaultLeavesOnApproval(
            @RequestBody Map<String, String> body) {

        UUID employeeId = UUID.fromString(body.get("employeeId"));
        LocalDate from = LocalDate.parse(body.get("from"));
        LocalDate to = LocalDate.parse(body.get("to"));
        String adminName = body.get("adminName");

        log.info("Applying default leaves | employeeId={} | from={} | to={}",
                employeeId, from, to);

        attendanceService.updateApprovedRecordsWithDefaultLeaves(
                employeeId, from, to, adminName);

        return ResponseEntity.ok(
                "Default leaves added, reset if new year, and deducted on approved records");
    }

    @GetMapping("/employee/{employeeId}/leaves")
    public ResponseEntity<Map<String, Integer>> getEmployeeLeaves(
            @PathVariable UUID employeeId) {

        log.debug("Fetching leave balance for employeeId={}", employeeId);

        Map<String, Integer> leaves =
                attendanceService.getEmployeeLeaves(employeeId);

        return ResponseEntity.ok(leaves);
    }
}
