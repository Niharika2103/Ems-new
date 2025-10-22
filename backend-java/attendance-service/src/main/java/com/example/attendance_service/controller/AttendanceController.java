package com.example.attendance_service.controller;
import java.util.List;
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
import com.example.attendance_service.responsedto.AttendanceResponseDTO;
import com.example.attendance_service.service.AttendanceService;
import java.util.ArrayList;


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
            @RequestBody(required = false) Optional<List<AttendanceRequestDTO>> attendanceListOpt) {

        List<AttendanceRequestDTO> attendanceList = attendanceListOpt.orElseGet(ArrayList::new);
        return attendanceService.saveOrUpdateAttendance(employeeId, projectId, attendanceList);
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
      
    @PostMapping("/release-weekly")
    public ResponseEntity<String> releaseWeekly(
            @RequestParam UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekEnd
    ) {
        attendanceService.releaseWeeklyAttendance(employeeId, weekStart, weekEnd);
        return ResponseEntity.ok("Weekly attendance released successfully.");
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
