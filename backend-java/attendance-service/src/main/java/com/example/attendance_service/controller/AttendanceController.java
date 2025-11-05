package com.example.attendance_service.controller;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.attendance_service.model.AttendanceEntity;
import com.example.attendance_service.requestdto.AttendanceRequestDTO;
import com.example.attendance_service.requestdto.LeaveDeductRequest;
import com.example.attendance_service.responsedto.AttendanceResponseDTO;
import com.example.attendance_service.service.AttendanceService;
import java.util.ArrayList;
import java.util.HashMap;


@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }
    
    
//save and update current week
    @PostMapping("/saveall")
    public List<AttendanceEntity> saveAllWeek(
            @RequestParam UUID employeeId,
            @RequestParam UUID projectId,
            @RequestParam String employeename,
            
            @RequestBody(required = false) Optional<List<AttendanceRequestDTO>> attendanceListOpt) {
System.out.println("@45::"+employeename);
        List<AttendanceRequestDTO> attendanceList = attendanceListOpt.orElseGet(ArrayList::new);
        return attendanceService.saveOrUpdateAttendance(employeeId, projectId, attendanceList, employeename);
    }
//fetch only current week
//    @GetMapping("/currentweek")
//    public List<AttendanceEntity> getOrCreateWeekData(
//            @RequestParam UUID employeeId,
//            @RequestParam UUID projectId) {
//
//        return attendanceService.getOrCreateCurrentWeek(employeeId, projectId);
//    }


    // ✅ Fetch custom week attendance
    
    @GetMapping("/week")
    public List<AttendanceEntity> getAttendanceForWeek(
            @RequestParam UUID employeeId,
            @RequestParam UUID projectId,
            @RequestParam String startDate) {  // format: yyyy-MM-dd

        LocalDate weekStart = LocalDate.parse(startDate.trim()); 
        return attendanceService.getAttendanceForWeek(employeeId, projectId, weekStart);
    }
      
    @GetMapping("/month/range")
    public List<AttendanceEntity> getAttendanceForMonthRange(
            @RequestParam UUID employeeId,          // required: specific employee
            @RequestParam String startDate,        // format: yyyy-MM-dd
            @RequestParam String endDate) {        // format: yyyy-MM-dd

        LocalDate start = LocalDate.parse(startDate.trim());
        LocalDate end = LocalDate.parse(endDate.trim());

        return attendanceService.getAttendanceForMonthRange(employeeId, start, end);
    }

    @PostMapping("/release-weekly")
    public ResponseEntity<String> releaseWeekly(
            @RequestParam UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekEnd
    ) {
        attendanceService.releaseWeeklyAttendance(employeeId, weekStart, weekEnd);
        return ResponseEntity.ok("Weekly attendance released successfully.");
    }
    
    @PostMapping("/release-monthly")
    public ResponseEntity<String> releaseMonth(
            @RequestParam UUID employeeId,
            @RequestParam UUID projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate monthStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate monthEnd) {

        System.out.println("✅ release-monthly called with:");
        System.out.println("Employee ID: " + employeeId);
        System.out.println("Project ID: " + projectId);
        System.out.println("Month Start: " + monthStart);
        System.out.println("Month End: " + monthEnd);

        attendanceService.releaseMonthlyAttendance(employeeId, projectId, monthStart, monthEnd);

        return ResponseEntity.ok("Monthly attendance released successfully.");
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
  
     @GetMapping("/approval-summary")
     public ResponseEntity<List<AttendanceResponseDTO>> getApprovalSummary(
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
             @RequestParam(defaultValue = "monthly") String periodType) {

         List<AttendanceResponseDTO> result = attendanceService.getApprovalSummary(startDate, endDate, periodType);
         return ResponseEntity.ok(result);
     }
     
     @GetMapping("/check-leave-eligibility")
     public ResponseEntity<Map<String, Object>> checkLeaveEligibility(
             @RequestParam UUID employeeId,
             @RequestParam String leaveType,
             @RequestParam(defaultValue = "1") int requestedDays) {

         boolean canApply = attendanceService.canApplyLeave(employeeId, leaveType, requestedDays);

         Map<String, Object> response = new HashMap<>();
         response.put("leaveType", leaveType);
         response.put("requestedDays", requestedDays);
         response.put("canApply", canApply);

         if (canApply) {
             response.put("message", " You can apply for " + leaveType);
             return ResponseEntity.ok(response);
         } else {
             response.put("message", " You have already used all available " + leaveType + " leaves.");
             return ResponseEntity.badRequest().body(response);
         }
     }

     @PostMapping("/deduct-leaves")
     public ResponseEntity<String> deductLeaves(@RequestBody LeaveDeductRequest request) {
         attendanceService.deductLeaves(request.getEmployeeId(), request.getFrom(), request.getTo());
         return ResponseEntity.ok("Leaves updated successfully");
     }
}
