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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;



@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AttendanceController {

	 @Value("${calendarific.api.key}")
	    private String apiKey;
	 
    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }
    
    
//save and update current week
    @PostMapping("/attendance/saveall")
    public List<AttendanceEntity> saveAllWeek(
            @RequestParam UUID employeeId,
            @RequestParam UUID projectId,
            @RequestParam String employeename,
            
            @RequestBody(required = false) Optional<List<AttendanceRequestDTO>> attendanceListOpt) {
System.out.println("@45::"+employeename);
        List<AttendanceRequestDTO> attendanceList = attendanceListOpt.orElseGet(ArrayList::new);
        return attendanceService.saveOrUpdateAttendance(employeeId, projectId, attendanceList, employeename);
    }
    
   

//    @GetMapping("/holidays/{year}")
//    public ResponseEntity<?> getIndianHolidays(@PathVariable int year) {
//        String url = "https://calendarific.com/api/v2/holidays?api_key=" + apiKey + "&country=IN&year=" + year;
//
//        RestTemplate restTemplate = new RestTemplate();
//        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
//
//        try {
//            ObjectMapper objectMapper = new ObjectMapper();
//            JsonNode responseBody = objectMapper.readTree(response.getBody());
//            JsonNode holidays = responseBody.path("response").path("holidays");
//
//            // ✅ Define list of important holidays to include
//            List<String> allowedNames = List.of(
//                "Sankranti",
//                "Makar Sankranti",
//                "Republic Day",
//                "Shivaratri",
//                "Shiva Ratri",
//                "Maha Shivaratri",
//                "Ugadi",
//                "Sri Rama Navami",
//                "Ram Navami",
//                "Ramzan",
//                "Ramadan",
//                "Eid al-Fitr",
//                "International Labour Day",
//                "May Day",
//                "Ganesh Chaturthi",
//                "Independence Day",
//                "Gandhi Jayanti",
//                "Dussehra",
//                "Dasara",
//                "Vijaya Dashami",
//                "Deepawali",
//                "Diwali",
//                "Christmas",
//                // Optional holidays
//                "Varalakshmi Vratam",
//                "New Year",
//                "New Year's Day",
//                "Bakrid",
//                "Eid al-Adha"
//            );
//
//            // ✅ Filter the holidays based on name matching
//            ArrayNode filteredHolidays = objectMapper.createArrayNode();
//            for (JsonNode holiday : holidays) {
//                String name = holiday.path("name").asText();
//                for (String keyword : allowedNames) {
//                    if (name.toLowerCase().contains(keyword.toLowerCase())) {
//                        filteredHolidays.add(holiday);
//                        break;
//                    }
//                }
//            }
//
//            // Replace holidays in original response
//            ((ObjectNode) responseBody.path("response")).set("holidays", filteredHolidays);
//
//            // ✅ Return the same structure, only filtered data
//            return ResponseEntity.ok(responseBody);
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(500).body("Failed to fetch or process holidays");
//        }
//    }

    
    

    // ✅ Fetch custom week attendance
    
    @GetMapping("/attendance/week")
    public List<AttendanceEntity> getAttendanceForWeek(
            @RequestParam UUID employeeId,
            @RequestParam UUID projectId,
            @RequestParam String startDate) {  // format: yyyy-MM-dd

        LocalDate weekStart = LocalDate.parse(startDate.trim()); 
        return attendanceService.getAttendanceForWeek(employeeId, projectId, weekStart);
    }
      
    @GetMapping("/attendance/month/range")
    public List<AttendanceEntity> getAttendanceForMonthRange(
            @RequestParam UUID employeeId,          // required: specific employee
            @RequestParam String startDate,        // format: yyyy-MM-dd
            @RequestParam String endDate) {        // format: yyyy-MM-dd

        LocalDate start = LocalDate.parse(startDate.trim());
        LocalDate end = LocalDate.parse(endDate.trim());

        return attendanceService.getAttendanceForMonthRange(employeeId, start, end);
    }

    @PostMapping("/attendance/release-weekly")
    public ResponseEntity<String> releaseWeekly(
            @RequestParam UUID employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekEnd
    ) {
        attendanceService.releaseWeeklyAttendance(employeeId, weekStart, weekEnd);
        return ResponseEntity.ok("Weekly attendance released successfully.");
    }
    
    @PostMapping("/attendance/release-monthly")
    public ResponseEntity<String> releaseMonth(
            @RequestParam UUID employeeId,
            @RequestParam UUID projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate monthStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate monthEnd) {

        System.out.println(" release-monthly called with:");
        System.out.println("Employee ID: " + employeeId);
        System.out.println("Project ID: " + projectId);
        System.out.println("Month Start: " + monthStart);
        System.out.println("Month End: " + monthEnd);

        attendanceService.releaseMonthlyAttendance(employeeId, projectId, monthStart, monthEnd);

        return ResponseEntity.ok("Monthly attendance released successfully.");
    }




 
     // ✅ GET all attendance
     @GetMapping("/attendance")
     public List<AttendanceResponseDTO> getAllAttendance() {
         return attendanceService.getAllAttendance();
     }

     // ✅ GET attendance by employee
     @GetMapping("/attendance/employee/{employeeId}")
     public List<AttendanceEntity> getAttendanceByEmployee(@PathVariable UUID employeeId) {
         return attendanceService.getAttendanceByEmployee(employeeId);
     }

     // ✅ GET attendance by project
     @GetMapping("/attendance/project/{projectId}")
     public List<AttendanceEntity> getAttendanceByProject(@PathVariable UUID projectId) {
         return attendanceService.getAttendanceByProject(projectId);
     }

     // ✅ GET attendance by both employee + project
     @GetMapping("/attendance/employee/{employeeId}/project/{projectId}")
     public List<AttendanceEntity> getAttendanceByEmployeeAndProject(@PathVariable UUID employeeId, @PathVariable UUID projectId) {
         return attendanceService.getAttendanceByEmployeeAndProject(employeeId, projectId);
     }
  
     @GetMapping("/attendance/approval-summary")
     public ResponseEntity<List<AttendanceResponseDTO>> getApprovalSummary(
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
             @RequestParam(defaultValue = "monthly") String periodType) {

         List<AttendanceResponseDTO> result = attendanceService.getApprovalSummary(startDate, endDate, periodType);
         return ResponseEntity.ok(result);
     }
     
     @GetMapping("/attendance/check-leave-eligibility")
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

     @PostMapping("/attendance/deduct-leaves")
     public ResponseEntity<String> deductLeaves(@RequestBody LeaveDeductRequest request) {
         attendanceService.deductLeaves(request.getEmployeeId(), request.getFrom(), request.getTo());
         return ResponseEntity.ok("Leaves updated successfully");
     }
     
     @PostMapping("/initialize-default-leaves")
     public ResponseEntity<String> initializeDefaultLeaves(@RequestBody Map<String, String> request) {
         UUID employeeId = UUID.fromString(request.get("employeeId"));
         String adminName = request.get("adminName");
         attendanceService.initializeDefaultLeaves(employeeId, adminName);
         return ResponseEntity.ok("Default leaves initialized successfully for employee.");
     }

}
