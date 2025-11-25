package com.example.attendance_service.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.DayOfWeek;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
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
						a.getProject() != null ? a.getProject().getProjectName() : null,
								 a.getEl(),
							        a.getSl(),
							        a.getExtraMilar(),
							        a.getWorkFromHome(),
							        a.getPaternityLeave(),
							        a.getMaternityLeave(),
							        a.getRemainingLeaves()		
						))
				.collect(Collectors.toList());
	}

	
	@Transactional
public List<AttendanceEntity> saveOrUpdateAttendance(
        UUID employeeId, UUID projectId,  List<AttendanceRequestDTO> attendanceList, String employeename) {

    if (employeeId == null || projectId == null) {
        return Collections.emptyList();
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

            //  Find if record exists for that exact date
            AttendanceEntity existing = attendanceRepository
                    .findByEmployee_IdAndProject_IdAndDate(employeeId, projectId, date)
                    .orElse(null);

            if (existing == null) {
                //  Create new record
                existing = new AttendanceEntity();
                existing.setEmployee(employee);
                existing.setProject(project);
                existing.setGender(employee.getGender());
                existing.setDate(date);
                existing.setYear(date.getYear());
                
                if (dto.getWorkedHours() == 0 && "sl".equalsIgnoreCase(dto.getLeaveType())) {
                    // ✅ Case: Sick Leave (SL)
                    LocalDate previousDate = dto.getDate().minusDays(1);
 
                    AttendanceEntity previousRecord = attendanceRepository
                            .findByEmployee_IdAndProject_IdAndDate(employeeId, projectId, previousDate)
                            .orElse(null);
 
                    if (previousRecord != null) {
                        existing.setSl(previousRecord.getSl() - 1);
                    }
                }


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
//                existing.setUpdatedBy(employeename);
//                existing.setUpdatedAt(LocalDateTime.now());
                existing.setRemainingLeaves(0);
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
public void releaseWeeklyAttendance(UUID employeeId, LocalDate weekStart, LocalDate weekEnd, String employeeName) {
    
	
	List<AttendanceEntity> attendanceList =
            attendanceRepository.findByEmployee_IdAndDateBetween(employeeId, weekStart, weekEnd);
	
	
   // Fetch all attendance records for this week
	List<AttendanceEntity> validRecords = attendanceList.stream()
            .filter(a -> a.getProject() != null)
            .collect(Collectors.toList());

    for (AttendanceEntity attendance : validRecords) {
        attendance.setStatus("Pending_approval");
        attendance.setCreatedBy(employeeName);        // Who released
        attendance.setCreatedAt(LocalDateTime.now());
    }
 
    
    // Save updates without touching monthlyStatus
    attendanceRepository.saveAll(validRecords);
}

@Transactional
public void releaseMonthlyAttendance(UUID employeeId, UUID projectId, LocalDate monthStart, LocalDate monthEnd, String employeeName) {
    // ✅ Fetch all attendance records for this employee + project + month
    List<AttendanceEntity> attendanceList =
            attendanceRepository.findByEmployee_IdAndProject_IdAndDateBetween(
                    employeeId, projectId, monthStart, monthEnd
            );

    System.out.println("@115: " + attendanceList);

    // ✅ Update monthly status safely
    for (AttendanceEntity attendance : attendanceList) {
        attendance.setMonthlyStatus("Pending_approval");
        attendance.setCreatedBy(employeeName);        // Who released
        attendance.setCreatedAt(LocalDateTime.now());
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
	@Transactional
	public List<AttendanceResponseDTO> getApprovalSummary(LocalDate startDate, LocalDate endDate, String periodType) {
	    List<AttendanceEntity> allRecords = attendanceRepository.findAllByOrderByDateAsc();
	    if (allRecords == null) allRecords = Collections.emptyList();

	    List<AttendanceEntity> recordsInRange = allRecords.stream()
	        .filter(a -> a.getDate() != null && !a.getDate().isBefore(startDate) && !a.getDate().isAfter(endDate))
	        .filter(a -> a.getEmployee() != null && a.getEmployee().getId() != null && a.getProject() != null)
	        .collect(Collectors.toList());

	    Map<String, List<AttendanceEntity>> grouped;
	    if ("weekly".equalsIgnoreCase(periodType)) {
	        grouped = recordsInRange.stream()
	            .collect(Collectors.groupingBy(a -> {
	                UUID empId = a.getEmployee().getId();
	                UUID projectId = a.getProject().getId();
	                LocalDate weekStart = a.getDate().with(java.time.DayOfWeek.MONDAY);
	                return empId + "_" + projectId + "_" + weekStart;
	            }));
	    } else {
	        grouped = recordsInRange.stream()
	            .collect(Collectors.groupingBy(a -> {
	                UUID empId = a.getEmployee().getId();
	                UUID projectId = a.getProject().getId();
	                return empId + "_" + projectId + "_" + startDate + "_" + endDate;
	            }));
	    }

	    return grouped.entrySet().stream().map(entry -> {
	        List<AttendanceEntity> records = entry.getValue();
	        AttendanceEntity first = records.get(0);

	        double totalWorkedHours = records.stream()
	            .mapToDouble(r -> r.getWorkedHours() != null ? r.getWorkedHours() : 0.0)
	            .sum();

	        // ✅ Use the LATEST record for leave balances (most accurate)
	        AttendanceEntity latest = records.stream()
	            .max(Comparator.comparing(AttendanceEntity::getDate))
	            .orElse(first);

	        UUID employeeId = first.getEmployee().getId();
	        String employeeName = first.getEmployee().getEmployeeName();
	        String gender = first.getEmployee().getGender();
	        Integer year = first.getYear();
	        UUID projectId = first.getProject().getId();
	        String projectName = first.getProject().getProjectName();

	        LocalDate periodStartDate = "weekly".equalsIgnoreCase(periodType)
	                ? first.getDate().with(java.time.DayOfWeek.MONDAY)
	                : startDate;

	        return new AttendanceResponseDTO(
	            null,
	            periodStartDate,
	            null,
	            totalWorkedHours,
	            null,
	            null,
	            year,
	            gender,
	            employeeId,
	            employeeName,
	            null,
	            projectId,
	            projectName,
	            // ➕ ADD LEAVE BALANCES FROM latest record
	            latest.getEl(),
	            latest.getSl(),
	            latest.getExtraMilar(),
	            latest.getWorkFromHome(),
	            latest.getPaternityLeave(),
	            latest.getMaternityLeave(),
	            latest.getRemainingLeaves()
	        );
	    })
	    .sorted(Comparator.comparing(AttendanceResponseDTO::getEmployeeName,
	            Comparator.nullsLast(String::compareToIgnoreCase)))
	    .collect(Collectors.toList());
	}
	@Transactional
	public boolean canApplyLeave(UUID employeeId, String leaveType, int requestedDays) {
	    // ✅ Count how many leaves of this type the employee has already taken
	    long takenLeaves = attendanceRepository.countByEmployee_IdAndLeaveType(employeeId, leaveType);

	    // ✅ Hardcoded allowed leave limits
	    int allowed = switch (leaveType) {
	        case "SL" -> 10;   // Sick Leave
	        case "EL" -> 25;  // Earned Leave
	        case "WFH" -> 315; // Work From Home
	        case "Extra Milar" -> 2;
	        case "Paternity Leave" -> 7;
	        case "Maternity Leave" -> 180;
	        case "Optional Holidays" -> 2;
	        case "Holidays" -> 10;
	        default -> 0;
	    };

	    // ✅ Compare requested vs available
	    return (takenLeaves + requestedDays) <= allowed;
	}
	
	
//	private Map<String, Double> calculateProRatedLeaves(LocalDate joiningDate) {
//	    int joiningMonth = joiningDate.getMonthValue();
//	    int monthsRemaining = 12 - joiningMonth + 1; 
//
//	    Map<String, Integer> yearlyLeaves = Map.of(
//	        "SL", 10,
//	        "EL", 25,
//	        "Extra Milar", 2,
//	        "Holidays", 10,
//	        "Optional Holidays", 2
//	    );
//
//	    Map<String, Double> proRated = new java.util.HashMap<>();
//	    yearlyLeaves.forEach((type, total) -> {
//	        double leaves = (total / 12.0) * monthsRemaining;
//	        proRated.put(type, Math.round(leaves * 100.0) / 100.0);
//	    });
//
//	    return proRated;
//	}
	
	// 🔹 Calculates leaves based on mid-year joining logic (Jan–Dec year)
	private Map<String, Integer> calculateLeavesBasedOnJoining(LocalDate joiningDate) {
	    // Full-year leave configuration
	    Map<String, Integer> yearlyLeaves = Map.of(
	        "SL", 10,
	        "EL", 25,
	        "Extra Milar", 2,
	        "Holidays", 10,
	        "Optional Holidays", 2
	    );

	    // 🗓️ Mid-year cutoff = June 30
	    LocalDate midYear = LocalDate.of(joiningDate.getYear(), 6, 30);
	    boolean joinedBeforeMidYear = !joiningDate.isAfter(midYear);

	    Map<String, Integer> finalLeaves = new java.util.HashMap<>();
	    yearlyLeaves.forEach((type, total) -> {
	        int leaves = joinedBeforeMidYear ? total : total / 2; // Half if joined after mid-year
	        finalLeaves.put(type, leaves);
	    });

	    return finalLeaves;
	}

//	@Transactional
//	public void initializeDefaultLeaves(UUID employeeId, String adminName) {
//	    
//	    boolean exists = attendanceRepository.existsByEmployee_IdAndProjectIsNull(employeeId);
//	    if (exists) {
//	        System.out.println("✅ Default leaves already exist for employee: " + employeeId);
//	        return;
//	    }
//
//	    //  Fetch employee info
//	    UserEmployeeMasterEntity employee = userRepository.findById(employeeId)
//	            .orElseThrow(() -> new RuntimeException("Employee not found"));
//
//	    LocalDate joiningDate = employee.getDateOfJoining();
//	    if (joiningDate == null) {
//	        throw new RuntimeException("Employee joining date is missing!");
//	    }
//
//	    // Compute leaves dynamically using your helper
//	    Map<String, Integer> leaveConfig = calculateLeavesBasedOnJoining(joiningDate);
//
//	    // Create base attendance record
//	    AttendanceEntity base = new AttendanceEntity();
//	    base.setEmployee(employee);
//	    base.setProject(null); // indicates organization-level base record
//	    base.setDate(joiningDate); 
//	    base.setYear(joiningDate.getYear());
//	    base.setGender(employee.getGender());
//
//	    //  Default approval states
//	    base.setStatus("approved");
//	    base.setWeeklyStatus("approved");
//	    base.setMonthlyStatus("approved");
//
//	    //  Assign leaves based on calculation
//	    base.setSl(leaveConfig.get("SL"));
//	    base.setEl(leaveConfig.get("EL"));
//	    base.setExtraMilar(leaveConfig.get("Extra Milar"));
//	    base.setHolidays(leaveConfig.get("Holidays"));
//	    base.setOptionalHolidays(leaveConfig.get("Optional Holidays"));
//
//	    int totalLeaves = leaveConfig.values().stream().mapToInt(Integer::intValue).sum();
//	    base.setRemainingLeaves(totalLeaves);
//
//	    // Initialize other leave types
//	    base.setWorkingDays(0);
//	    base.setWorkFromHome(0);
//	    base.setMaternityLeave(0);
//	    base.setPaternityLeave(0);
//
//	    // Mandatory non-null columns
//	    base.setWorkedHours(0.0);
//	    base.setTotalWorkedHours(0.0);
//	    base.setLeaveType("");
//	    base.setUpdatedBy(adminName);
//	    base.setUpdatedAt(LocalDateTime.now());
//
//	    // Save record
//	    attendanceRepository.save(base);
//
//	    System.out.println(" Default leaves (pro-rated) created for employee ID: "
//	            + employee.getId() + " | Joined: " + joiningDate);
//	}
	@Transactional
	public void updateApprovedRecordsWithDefaultLeaves(UUID employeeId, LocalDate from, LocalDate to, String adminName) {
	    List<AttendanceEntity> records = attendanceRepository.findByEmployee_IdAndDateBetween(employeeId, from, to);
	    if (records.isEmpty()) return;

	    records.sort(Comparator.comparing(AttendanceEntity::getDate));

	    UserEmployeeMasterEntity employee = records.get(0).getEmployee();
	    LocalDate joiningDate = employee.getDateOfJoining();
	    if (joiningDate == null) {
	        throw new RuntimeException("Employee joining date is missing for ID: " + employeeId);
	    }

	    // ✅ Step 1: Get the last approved record before 'from'
	    List<AttendanceEntity> approvedBeforeList = attendanceRepository.findLastApprovedBeforeDate(employeeId, from);
	    AttendanceEntity lastRelevant = approvedBeforeList.isEmpty() ? null : approvedBeforeList.get(0);

	    // ✅ Step 2: Initialize current leave balances
	    int currentSL = 0, currentEL = 0, currentExtraMilar = 0, currentHolidays = 0, currentOptionalHolidays = 0, currentRemaining = 0;

	    if (lastRelevant != null) {
	        // Carry forward from last approved record
	        currentSL = safeGet(lastRelevant.getSl(), 0);
	        currentEL = safeGet(lastRelevant.getEl(), 0);
	        currentExtraMilar = safeGet(lastRelevant.getExtraMilar(), 0);
	        currentHolidays = safeGet(lastRelevant.getHolidays(), 0);
	        currentOptionalHolidays = safeGet(lastRelevant.getOptionalHolidays(), 0);
	        currentRemaining = safeGet(lastRelevant.getRemainingLeaves(), 0);
	        System.out.println("🔁 Carrying forward leave balances from: " + lastRelevant.getDate());
	    } else {
	        // No approved record yet — first-time initialization
	        Map<String, Integer> defaultLeaves = calculateLeavesBasedOnJoining(joiningDate);
	        currentSL = defaultLeaves.get("SL");
	        currentEL = defaultLeaves.get("EL");
	        currentExtraMilar = defaultLeaves.get("Extra Milar");
	        currentHolidays = defaultLeaves.get("Holidays");
	        currentOptionalHolidays = defaultLeaves.get("Optional Holidays");
	        currentRemaining = defaultLeaves.values().stream().mapToInt(Integer::intValue).sum();
	        System.out.println("🆕 Initialized default leaves for first-time approval: " + employee.getEmployeeName());
	    }

	    int lastProcessedYear = from.minusDays(1).getYear();

	    // ✅ Step 3: Process each record in date order
	    for (AttendanceEntity rec : records) {
	        LocalDate recDate = rec.getDate();
	        int recYear = recDate.getYear();

	        // 🎯 Step 3A: Handle year transition
	        if (recYear > lastProcessedYear) {
	            System.out.println("🌍 New year detected for " + employee.getEmployeeName() + " → " + recYear);

	            // 💾 Carry forward only EL (up to 10 days)
	            int carryForwardEL = 0;
	            if (currentEL >= 10) {
	                carryForwardEL = Math.min(currentEL, 10);
	                System.out.printf("🎯 %s → Carry forward %d EL days to %d%n",
	                        employee.getEmployeeName(), carryForwardEL, recYear);
	            } else {
	                System.out.printf("🚫 %s → No EL carry forward (EL=%d) for year %d%n",
	                        employee.getEmployeeName(), currentEL, recYear);
	            }


	            // 🧮 Load new year default leaves
	            Map<String, Integer> yearlyLeaves = calculateLeavesBasedOnJoining(LocalDate.of(recYear, 1, 1));

	            currentSL = yearlyLeaves.get("SL"); // SL reset
	            currentEL = yearlyLeaves.get("EL") + carryForwardEL; // EL + carry forward (max 10)
	            currentExtraMilar = yearlyLeaves.get("Extra Milar"); // reset
	            currentHolidays = yearlyLeaves.get("Holidays"); // reset
	            currentOptionalHolidays = yearlyLeaves.get("Optional Holidays"); // reset
	            currentRemaining = currentSL + currentEL + currentExtraMilar + currentHolidays + currentOptionalHolidays;

	            System.out.printf("🎯 %s → Carry forward %d EL days to %d%n",
	                    employee.getEmployeeName(), carryForwardEL, recYear);
	        }

	        // 📝 Apply balances to record
	        rec.setSl(currentSL);
	        rec.setEl(currentEL);
	        rec.setExtraMilar(currentExtraMilar);
	        rec.setHolidays(currentHolidays);
	        rec.setOptionalHolidays(currentOptionalHolidays);
	        rec.setRemainingLeaves(currentRemaining);

	        // 🧩 Deduct leave if taken
	        String leaveType = rec.getLeaveType();
	        if (leaveType != null && !leaveType.trim().isEmpty()) {
	            switch (leaveType.trim().toLowerCase()) {
	                case "sl" -> {
	                    currentSL = Math.max(0, currentSL - 1);
	                    currentRemaining = Math.max(0, currentRemaining - 1);
	                }
	                case "el" -> {
	                    currentEL = Math.max(0, currentEL - 1);
	                    currentRemaining = Math.max(0, currentRemaining - 1);
	                }
	                case "optional holidays" -> {
	                    currentOptionalHolidays = Math.max(0, currentOptionalHolidays - 1);
	                    currentRemaining = Math.max(0, currentRemaining - 1);
	                }
	                case "holidays" -> {
	                    currentHolidays = Math.max(0, currentHolidays - 1);
	                    currentRemaining = Math.max(0, currentRemaining - 1);
	                }
	                case "extra milar" -> {
	                    currentExtraMilar = Math.max(0, currentExtraMilar - 1);
	                    currentRemaining = Math.max(0, currentRemaining - 1);
	                }
	                default -> { /* No deduction for WFH/Present */ }
	            }
	            System.out.println("➖ Deducted " + leaveType + " for " + employee.getEmployeeName() + " on " + recDate);
	        }

	        rec.setStatus("approved");
	        rec.setUpdatedBy(adminName);
	        rec.setUpdatedAt(LocalDateTime.now());
	        lastProcessedYear = recYear;
	        lastRelevant = rec;
	    }

	    attendanceRepository.saveAll(records);  
	    System.out.println("✅ Successfully updated " + records.size() + " records with yearly EL carry-forward (max 10 days).");
	}

	private int safeGet(Integer value, int defaultValue) {
	    return value != null ? value : defaultValue;
	}
	
	@Transactional
	public Map<String, Integer> getEmployeeLeaves(UUID employeeId) {

	    if (employeeId == null)
	        return Collections.emptyMap();

	    // Fetch all records
	    List<AttendanceEntity> records =
	            attendanceRepository.findByEmployee_IdOrderByDateAsc(employeeId);

	    if (records.isEmpty())
	        return Collections.emptyMap();

	    // Latest entry
	    AttendanceEntity latest = records.get(records.size() - 1);

	    // Default company totals
	    final int TOTAL_EL = 25;
	    final int TOTAL_SL = 10;
	    final int TOTAL_HOLIDAYS = 10;
	    final int TOTAL_OPTIONAL = 2;
	    final int TOTAL_EXTRA_MILAR = 2;
	    final int TOTAL_MATERNITY = 180;
	    final int TOTAL_PATERNITY = 7;

	    // "Used" values taken directly from existing AttendanceEntity columns
	    int usedEL = safe(latest.getEl());
	    int usedSL = safe(latest.getSl());
	    int usedHolidays = safe(latest.getHolidays());
	    int usedOptional = safe(latest.getOptionalHolidays());
	    int usedExtra = safe(latest.getExtraMilar());
	    int usedMat = safe(latest.getMaternityLeave());
	    int usedPat = safe(latest.getPaternityLeave());

	    Map<String, Integer> map = new HashMap<>();

	    // Holidays
	    map.put("holidays", TOTAL_HOLIDAYS);
	    map.put("holidays_used", usedHolidays);
	    map.put("holidays_remaining", TOTAL_HOLIDAYS - usedHolidays);

	    // Optional
	    map.put("optional_holidays", TOTAL_OPTIONAL);
	    map.put("optional_holidays_used", usedOptional);
	    map.put("optional_holidays_remaining", TOTAL_OPTIONAL - usedOptional);

	    // EL
	    map.put("el", TOTAL_EL);
	    map.put("el_used", usedEL);
	    map.put("el_remaining", TOTAL_EL - usedEL);

	    // SL
	    map.put("sl", TOTAL_SL);
	    map.put("sl_used", usedSL);
	    map.put("sl_remaining", TOTAL_SL - usedSL);

	    // Extra Milar
	    map.put("extra_milar", TOTAL_EXTRA_MILAR);
	    map.put("extra_milar_used", usedExtra);
	    map.put("extra_milar_remaining", TOTAL_EXTRA_MILAR - usedExtra);

	    // Maternity
	    map.put("maternity_leave", TOTAL_MATERNITY);
	    map.put("maternity_leave_used", usedMat);
	    map.put("maternity_leave_remaining", TOTAL_MATERNITY - usedMat);

	    // Paternity
	    map.put("paternity_leave", TOTAL_PATERNITY);
	    map.put("paternity_leave_used", usedPat);
	    map.put("paternity_leave_remaining", TOTAL_PATERNITY - usedPat);

	    return map;
	}

	private int safe(Integer v) {
	    return v != null ? v : 0;
	}

	
}