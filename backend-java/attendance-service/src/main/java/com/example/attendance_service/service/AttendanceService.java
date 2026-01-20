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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.example.attendance_service.model.AttendanceEntity;
import com.example.attendance_service.model.LeaveTypeEntity;
import com.example.attendance_service.model.ProjectEntity;
import com.example.attendance_service.model.UserEmployeeMasterEntity;
import com.example.attendance_service.repository.AttendanceRepository;
import com.example.attendance_service.repository.LeaveTypeRepository;
import com.example.attendance_service.repository.ProbationRepository;
import com.example.attendance_service.repository.ProjectRepository;
import com.example.attendance_service.repository.UserEmployeeMasterRepository;
import com.example.attendance_service.requestdto.AttendanceRequestDTO;
import com.example.attendance_service.responsedto.AttendanceResponseDTO;

import jakarta.transaction.Transactional;

@Service
public class AttendanceService {

    private static final Logger log =
            LoggerFactory.getLogger(AttendanceService.class);

    private final AttendanceRepository attendanceRepository;
    private final ProjectRepository projectRepository;
    private final UserEmployeeMasterRepository userRepository;
    private final ProbationRepository probationRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            ProjectRepository projectRepository,
            UserEmployeeMasterRepository userRepository,
            ProbationRepository probationRepository,
            LeaveTypeRepository leaveTypeRepository
    ) {
        this.attendanceRepository = attendanceRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.probationRepository = probationRepository;
        this.leaveTypeRepository = leaveTypeRepository;
    }

    public boolean isInProbation(UUID employeeId, LocalDate date) {
        boolean result = probationRepository
                .findProbationForDate(employeeId, "active", date)
                .isPresent();

        log.debug("Probation check → employeeId={}, date={}, result={}",
                employeeId, date, result);

        return result;
    }

    public List<AttendanceResponseDTO> getAllAttendance() {
        log.info("Fetching all attendance records");

        List<AttendanceEntity> entities =
                attendanceRepository.findAllByOrderByDateAsc();

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
                        a.getEmployee() != null ? a.getEmployee().getId() : null,
                        a.getEmployee() != null ? a.getEmployee().getEmployeeName() : null,
                        a.getEmployee() != null ? a.getEmployee().getGender() : null,
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
            UUID employeeId,
            UUID projectId,
            List<AttendanceRequestDTO> attendanceList,
            String employeename) {

        log.info("Save/Update attendance → employeeId={}, projectId={}, employeeName={}",
                employeeId, projectId, employeename);

        if (employeeId == null || projectId == null) {
            log.warn("EmployeeId or ProjectId is null");
            return Collections.emptyList();
        }

        UserEmployeeMasterEntity employee = userRepository.findById(employeeId)
                .orElseThrow(() -> {
                    log.error("Employee not found: {}", employeeId);
                    return new RuntimeException("Employee not found");
                });

        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> {
                    log.error("Project not found: {}", projectId);
                    return new RuntimeException("Project not found");
                });

        double cumulativeTotal = 0.0;
        List<AttendanceEntity> allRecords = new ArrayList<>();

        if (attendanceList != null && !attendanceList.isEmpty()) {

            attendanceList.sort(Comparator.comparing(AttendanceRequestDTO::getDate));

            for (AttendanceRequestDTO dto : attendanceList) {

                LocalDate date = dto.getDate();
                if (date == null) continue;

                AttendanceEntity existing = attendanceRepository
                        .findByEmployee_IdAndProject_IdAndDate(employeeId, projectId, date)
                        .orElse(null);

                if (existing == null) {
                    existing = new AttendanceEntity();
                    existing.setEmployee(employee);
                    existing.setProject(project);
                    existing.setGender(employee.getGender());
                    existing.setDate(date);
                    existing.setYear(date.getYear());
                }

                existing.setLeaveType(dto.getLeaveType());

                if (dto.getLeaveType() == null || dto.getLeaveType().isEmpty()) {
                    existing.setWorkedHours(
                            dto.getWorkedHours() != null ? dto.getWorkedHours() : 0.0
                    );
                } else {
                    existing.setWorkedHours(0.0);
                }

                existing.setStatus("draft");
                existing.setMonthlyStatus("draft");

                cumulativeTotal += existing.getWorkedHours();
                existing.setTotalWorkedHours(cumulativeTotal);

                attendanceRepository.save(existing);
                allRecords.add(existing);
            }
        }

        log.info("Attendance saved successfully → records={}", allRecords.size());

        return allRecords.stream()
                .sorted(Comparator.comparing(AttendanceEntity::getDate))
                .collect(Collectors.toList());
    }

    @Transactional
    public void releaseMonthlyAttendance(
            UUID employeeId,
            UUID projectId,
            LocalDate monthStart,
            LocalDate monthEnd,
            String employeeName) {

        log.info("Release monthly attendance → employeeId={}, projectId={}, from={}, to={}",
                employeeId, projectId, monthStart, monthEnd);

        List<AttendanceEntity> attendanceList =
                attendanceRepository.findByEmployee_IdAndProject_IdAndDateBetween(
                        employeeId, projectId, monthStart, monthEnd
                );

        log.debug("Monthly attendance records found: {}", attendanceList.size());

        for (AttendanceEntity attendance : attendanceList) {
            attendance.setMonthlyStatus("Pending_approval");
            attendance.setCreatedBy(employeeName);
            attendance.setCreatedAt(LocalDateTime.now());
        }

        attendanceRepository.saveAll(attendanceList);
    }


 // ✅ Get by employee
    public List<AttendanceEntity> getAttendanceByEmployee(UUID employeeId) {

        log.info("Fetching attendance by employeeId={}", employeeId);

        List<AttendanceEntity> result =
                attendanceRepository.findByEmployee_IdOrderByDateAsc(employeeId);

        log.debug("Attendance records found for employeeId={} → {}",
                employeeId, result.size());

        return result;
    }

    // ✅ Get by project
    public List<AttendanceEntity> getAttendanceByProject(UUID projectId) {

        log.info("Fetching attendance by projectId={}", projectId);

        List<AttendanceEntity> result =
                attendanceRepository.findByProject_IdOrderByDateAsc(projectId);

        log.debug("Attendance records found for projectId={} → {}",
                projectId, result.size());

        return result;
    }

    // ✅ Get by both employee + project
    public List<AttendanceEntity> getAttendanceByEmployeeAndProject(
            UUID employeeId, UUID projectId) {

        log.info("Fetching attendance by employeeId={} and projectId={}",
                employeeId, projectId);

        List<AttendanceEntity> result =
                attendanceRepository
                        .findByEmployee_IdAndProject_IdOrderByDateAsc(employeeId, projectId);

        log.debug("Attendance records found → {}", result.size());

        return result;
    }

    @Transactional
    public List<AttendanceResponseDTO> getApprovalSummary(
            LocalDate startDate, LocalDate endDate, String periodType) {

        log.info("Approval summary request → startDate={}, endDate={}, periodType={}",
                startDate, endDate, periodType);

        List<AttendanceEntity> allRecords =
                attendanceRepository.findAllByOrderByDateAsc();

        if (allRecords == null) {
            log.warn("No attendance records found in database");
            allRecords = Collections.emptyList();
        }

        List<AttendanceEntity> recordsInRange = allRecords.stream()
                .filter(a -> a.getDate() != null &&
                        !a.getDate().isBefore(startDate) &&
                        !a.getDate().isAfter(endDate))
                .filter(a -> a.getEmployee() != null &&
                        a.getEmployee().getId() != null &&
                        a.getProject() != null)
                .collect(Collectors.toList());

        log.debug("Records in range after filter → {}", recordsInRange.size());

        Map<String, List<AttendanceEntity>> grouped;

        if ("weekly".equalsIgnoreCase(periodType)) {
            grouped = recordsInRange.stream()
                    .collect(Collectors.groupingBy(a -> {
                        UUID empId = a.getEmployee().getId();
                        UUID projectId = a.getProject().getId();
                        LocalDate weekStart =
                                a.getDate().with(java.time.DayOfWeek.MONDAY);
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

        log.debug("Grouped approval records → {}", grouped.size());

        return grouped.entrySet().stream().map(entry -> {

            List<AttendanceEntity> records = entry.getValue();
            AttendanceEntity first = records.get(0);

            double totalWorkedHours = records.stream()
                    .mapToDouble(r -> r.getWorkedHours() != null ? r.getWorkedHours() : 0.0)
                    .sum();

            AttendanceEntity latest = records.stream()
                    .max(Comparator.comparing(AttendanceEntity::getDate))
                    .orElse(first);

            UUID employeeId = first.getEmployee().getId();
            String employeeName = first.getEmployee().getEmployeeName();
            String gender = first.getEmployee().getGender();
            Integer year = first.getYear();
            UUID projectId = first.getProject().getId();
            String projectName = first.getProject().getProjectName();

            LocalDate periodStartDate =
                    "weekly".equalsIgnoreCase(periodType)
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
                    latest.getEl(),
                    latest.getSl(),
                    latest.getExtraMilar(),
                    latest.getWorkFromHome(),
                    latest.getPaternityLeave(),
                    latest.getMaternityLeave(),
                    latest.getRemainingLeaves()
            );
        })
        .sorted(Comparator.comparing(
                AttendanceResponseDTO::getEmployeeName,
                Comparator.nullsLast(String::compareToIgnoreCase)))
        .collect(Collectors.toList());
    }

    @Transactional
    public List<AttendanceResponseDTO> getFreelancerApprovalSummary(
            LocalDate startDate, LocalDate endDate, String periodType) {
 
        List<AttendanceEntity> allRecords = attendanceRepository.findAllByOrderByDateAsc();
 
        if (allRecords == null) allRecords = Collections.emptyList();
 
        List<AttendanceEntity> recordsInRange = allRecords.stream()
            .filter(a -> a.getDate() != null
                    && !a.getDate().isBefore(startDate)
                    && !a.getDate().isAfter(endDate))
            .filter(a -> a.getEmployee() != null
                    && a.getEmployee().getId() != null
                    && a.getProject() != null)
            // 🔴 MAIN FILTER FOR FREELANCERS
            .filter(a -> a.getEmployee().getEmploymentType() != null &&
                         a.getEmployee().getEmploymentType().equalsIgnoreCase("freelancer"))
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
    public boolean canApplyLeave(
            UUID employeeId, String leaveType, int requestedDays) {

        log.info("Checking leave eligibility → employeeId={}, leaveType={}, requestedDays={}",
                employeeId, leaveType, requestedDays);

        long takenLeaves =
                attendanceRepository.countByEmployee_IdAndLeaveType(employeeId, leaveType);

        int allowed = getMaxBalance(leaveType);

        boolean result = (takenLeaves + requestedDays) <= allowed;

        log.debug("Leave check result → taken={}, allowed={}, result={}",
                takenLeaves, allowed, result);

        return result;
    }

//	@Transactional
//	public boolean canApplyLeave(UUID employeeId, String leaveType, int requestedDays) {
//	    // ✅ Count how many leaves of this type the employee has already taken
//	    long takenLeaves = attendanceRepository.countByEmployee_IdAndLeaveType(employeeId, leaveType);
//
//	    // ✅ Hardcoded allowed leave limits
//	    int allowed = switch (leaveType) {
//	        case "SL" -> 10;   // Sick Leave
//	        case "EL" -> 25;  // Earned Leave
//	        case "WFH" -> 315; // Work From Home
//	        case "Extra Milar" -> 2;
//	        case "Paternity Leave" -> 7;
//	        case "Maternity Leave" -> 180;
//	        case "Optional Holidays" -> 2;
//	        case "Holidays" -> 10;
//	        default -> 0;
//	    };
//
//	    // ✅ Compare requested vs available
//	    return (takenLeaves + requestedDays) <= allowed;
//	}
	
	
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
	

//
//	@Transactional
//	public void updateApprovedRecordsWithDefaultLeaves(UUID employeeId, LocalDate from, LocalDate to, String adminName) {
//
//	    List<AttendanceEntity> records = attendanceRepository
//	            .findByEmployee_IdAndDateBetween(employeeId, from, to);
//
//	    if (records.isEmpty()) return;
//
//	    records.sort(Comparator.comparing(AttendanceEntity::getDate));
//
//	    UserEmployeeMasterEntity employee = records.get(0).getEmployee();
//	    LocalDate joiningDate = employee.getDateOfJoining();
//
//	    if (joiningDate == null) {
//	        throw new RuntimeException("Employee joining date missing for ID: " + employeeId);
//	    }
//
//	    // Fetch last approved before this range
//	    List<AttendanceEntity> approvedBefore = attendanceRepository
//	            .findLastApprovedBeforeDate(employeeId, from);
//
//	    AttendanceEntity lastRelevant = approvedBefore.isEmpty() ? null : approvedBefore.get(0);
//
//	    // Leave balances
//	    int currentSL = 0, currentEL = 0, currentHolidays = 0,
//	            currentOptional = 0, currentExtra = 0, currentRemaining = 0;
//
//	    // INITIALIZE FROM LAST RELEVANT
//	    if (lastRelevant != null) {
//	        currentSL = safeGet(lastRelevant.getSl(), 0);
//	        currentEL = safeGet(lastRelevant.getEl(), 0);
//	        currentHolidays = safeGet(lastRelevant.getHolidays(), 0);
//	        currentOptional = safeGet(lastRelevant.getOptionalHolidays(), 0);
//	        currentExtra = safeGet(lastRelevant.getExtraMilar(), 0);
//	        currentRemaining = safeGet(lastRelevant.getRemainingLeaves(), 0);
//	    } else {
//	        // First time initialization → use joining date logic
//	        Map<String, Integer> leaves = calculateLeavesBasedOnJoining(joiningDate);
//	        currentSL = leaves.get("SL");
//	        currentEL = leaves.get("EL");
//	        currentHolidays = leaves.get("Holidays");
//	        currentOptional = leaves.get("Optional Holidays");
//	        currentExtra = leaves.get("Extra Milar");
//	        currentRemaining =
//	                currentSL + currentEL + currentHolidays + currentOptional + currentExtra;
//	    }
//
//	    int lastProcessedYear = from.minusDays(1).getYear();
//	    YearMonth lastMonth = null;
//
//	    for (AttendanceEntity rec : records) {
//
//	        LocalDate recDate = rec.getDate();
//	        int recYear = recDate.getYear();
//	        YearMonth currentMonth = YearMonth.from(recDate);
//
//	        boolean inProbation = isInProbation(employeeId, recDate);
//
//	        //==================================================
//	        // YEAR CHANGE – ONLY IF NOT IN PROBATION
//	        //==================================================
//	        if (!inProbation && recYear > lastProcessedYear) {
//
//	            int carryForwardEL = currentEL >= 10 ? 10 : 0;
//
//	            Map<String, Integer> newLeaves =
//	                    calculateLeavesBasedOnJoining(LocalDate.of(recYear, 1, 1));
//
//	            currentSL = newLeaves.get("SL");
//	            currentEL = newLeaves.get("EL") + carryForwardEL;
//	            currentHolidays = newLeaves.get("Holidays");
//	            currentOptional = newLeaves.get("Optional Holidays");
//	            currentExtra = newLeaves.get("Extra Milar");
//
//	            currentRemaining =
//	                    currentSL + currentEL + currentHolidays + currentOptional + currentExtra;
//	        }
//
//	        //==================================================
//	        // PROBATION LOGIC — STRICT 1 SL PER MONTH
//	        //==================================================
//	        if (inProbation) {
//
//	            // Reset SL = 1 at START of each new month
//	            if (lastMonth == null || !currentMonth.equals(lastMonth)) {
//	                currentSL = 1;
//	            }
//
//	            // SL cannot exceed 1 anytime
//	            currentSL = Math.min(currentSL, 1);
//
//	            // Assign probation leave values
//	            rec.setSl(currentSL);
//	            rec.setEl(0);
//	            rec.setExtraMilar(0);
//	            rec.setOptionalHolidays(0);
//
//	            // Holidays allowed normally
//	            rec.setHolidays(currentHolidays);
//
//	            // Remaining leaves = SL + holidays
//	            rec.setRemainingLeaves(currentSL + currentHolidays);
//
//	            //============ Probation Leave DEDUCTION ============
//	            String lt = rec.getLeaveType() == null ? "" : rec.getLeaveType().trim().toLowerCase();
//
//	            if (lt.equals("sl")) {
//	                currentSL = Math.max(currentSL - 1, 0);
//	            }
//	            else if (lt.equals("holidays")) {
//	                currentHolidays = Math.max(currentHolidays - 1, 0);
//	            }
//
//	            // Update remaining after deduction
//	            rec.setRemainingLeaves(currentSL + currentHolidays);
//
//	            // Save meta
//	            rec.setStatus("approved");
//	            rec.setUpdatedBy(adminName);
//	            rec.setUpdatedAt(LocalDateTime.now());
//
//	            lastProcessedYear = recYear;
//	            lastMonth = currentMonth;
//	            lastRelevant = rec;
//	            continue; // IMPORTANT → skip normal leave logic
//	        }
//
//	        //==================================================
//	        // NORMAL LEAVE LOGIC — AFTER PROBATION
//	        //==================================================
//
//	        rec.setSl(currentSL);
//	        rec.setEl(currentEL);
//	        rec.setExtraMilar(currentExtra);
//	        rec.setOptionalHolidays(currentOptional);
//	        rec.setHolidays(currentHolidays);
//
//	        currentRemaining =
//	                currentSL + currentEL + currentHolidays + currentOptional + currentExtra;
//	        rec.setRemainingLeaves(currentRemaining);
//
//	        //============ Normal Leave DEDUCTION ============
//
//	        String leaveType = rec.getLeaveType();
//	        if (leaveType != null && !leaveType.isBlank()) {
//	            String t = leaveType.trim().toLowerCase();
//
//	            switch (t) {
//	                case "sl" -> currentSL = Math.max(currentSL - 1, 0);
//	                case "el" -> currentEL = Math.max(currentEL - 1, 0);
//	                case "optional holidays" -> currentOptional = Math.max(currentOptional - 1, 0);
//	                case "holidays" -> currentHolidays = Math.max(currentHolidays - 1, 0);
//	                case "extra milar" -> currentExtra = Math.max(currentExtra - 1, 0);
//	            }
//	        }
//
//	        rec.setStatus("approved");
//	        rec.setUpdatedBy(adminName);
//	        rec.setUpdatedAt(LocalDateTime.now());
//
//	        lastProcessedYear = recYear;
//	        lastMonth = currentMonth;
//	        lastRelevant = rec;
//	    }
//
//	    attendanceRepository.saveAll(records);
//	}

    @Transactional
    public void updateApprovedRecordsWithDefaultLeaves(
            UUID employeeId, LocalDate from, LocalDate to, String adminName) {

        log.info("Updating approved records with default leaves → employeeId={}, from={}, to={}, admin={}",
                employeeId, from, to, adminName);

        List<AttendanceEntity> records =
                attendanceRepository.findByEmployee_IdAndDateBetween(employeeId, from, to);

        if (records.isEmpty()) {
            log.warn("No attendance records found for employeeId={} between {} and {}",
                    employeeId, from, to);
            return;
        }

        // ALWAYS SORT BY DATE ASC
        records.sort(Comparator.comparing(AttendanceEntity::getDate));

        UserEmployeeMasterEntity employee = records.get(0).getEmployee();
        LocalDate joiningDate = employee.getDateOfJoining();

        if (joiningDate == null) {
            log.error("Joining date missing for employeeId={}", employeeId);
            throw new RuntimeException("Employee joining date missing!");
        }

        // BALANCES
        int slBalance = 0;
        int elBalance = 0;

        // TRACK EARNED SL/EL THIS YEAR
        int slEarnedThisYear = 0;
        int elEarnedThisYear = 0;

        int currentLOP = 0;

        // YEARLY LIMITS
        int slYearLimit = 0;
        int elYearLimit = 0;

        // TRACK MONTH/YEAR
        YearMonth lastMonth = null;
        int lastYear = -1;

        for (AttendanceEntity rec : records) {

            LocalDate recDate = rec.getDate();
            int recYear = recDate.getYear();
            YearMonth currMonth = YearMonth.from(recDate);

            boolean inProbation = isInProbation(employeeId, recDate);

            log.debug("Processing date={} | year={} | month={} | probation={}",
                    recDate, recYear, currMonth, inProbation);

            // ================================
            // YEAR CHANGE (NOT in PROBATION)
            // ================================
            if (!inProbation && lastYear != -1 && recYear > lastYear) {

                log.info("Year change detected → previousYear={}, newYear={}",
                        lastYear, recYear);

                int carry = Math.min(elBalance, 10);

                slBalance = 0;
                elBalance = carry;

                slEarnedThisYear = 0;
                elEarnedThisYear = 0;

                Map<String, Integer> limits =
                        calculateYearlyLimits(joiningDate, recYear);

                slYearLimit = limits.get("SL_LIMIT");
                elYearLimit = limits.get("EL_LIMIT");

                log.debug("New yearly limits → SL={}, EL={}",
                        slYearLimit, elYearLimit);

                lastMonth = null;
            }

            // First-time yearly limit setup
            if (lastYear == -1) {

                Map<String, Integer> limits =
                        calculateYearlyLimits(joiningDate, recYear);

                slYearLimit = limits.get("SL_LIMIT");
                elYearLimit = limits.get("EL_LIMIT");

                log.debug("Initial yearly limits → SL={}, EL={}",
                        slYearLimit, elYearLimit);
            }

            // ================================
            // MONTH RESET SECTION
            // ================================
            if (lastMonth == null || !currMonth.equals(lastMonth)) {

                log.debug("Month reset detected → {}", currMonth);

                currentLOP = 0;

                if (inProbation) {
                    slBalance = 1;
                    elBalance = 0;
                } else {

                    if (slEarnedThisYear < slYearLimit) {
                        int addSL = Math.min(1, slYearLimit - slEarnedThisYear);
                        slBalance += addSL;
                        slEarnedThisYear += addSL;
                    }

                    if (elEarnedThisYear < elYearLimit) {
                        int addEL = Math.min(2, elYearLimit - elEarnedThisYear);
                        elBalance += addEL;
                        elEarnedThisYear += addEL;
                    }
                }
            }

            // ================================
            // LEAVE TYPE DEDUCTION LOGIC
            // ================================
            String lt = rec.getLeaveType() == null
                    ? ""
                    : rec.getLeaveType().trim().toLowerCase();

            log.debug("Leave deduction → date={}, leaveType={}, SL={}, EL={}, LOP={}, probation={}",
                    rec.getDate(), lt, slBalance, elBalance, currentLOP, inProbation);

            switch (lt) {

                case "sl":
                    if (slBalance > 0) {
                        slBalance--;
                    } else {
                        currentLOP++;
                    }
                    break;

                case "el":
                    if (!inProbation && elBalance > 0) {
                        elBalance--;
                    } else {
                        currentLOP++;
                    }
                    break;

                default:
                    break;
            }

            // ================================
            // SAVE BACK TO ENTITY
            // ================================
            rec.setSl(slBalance);
            rec.setEl(elBalance);
            rec.setLop(currentLOP);

            if (inProbation) {
                rec.setRemainingLeaves(slBalance);
            } else {
                rec.setRemainingLeaves(slBalance + elBalance);
            }

            rec.setStatus("approved");
            rec.setUpdatedBy(adminName);
            rec.setUpdatedAt(LocalDateTime.now());

            log.debug("Record updated → date={}, SL={}, EL={}, LOP={}, remaining={}",
                    rec.getDate(),
                    rec.getSl(),
                    rec.getEl(),
                    rec.getLop(),
                    rec.getRemainingLeaves());

            lastMonth = currMonth;
            lastYear = recYear;
        }

 attendanceRepository.saveAll(records);

 log.info("Approved records saved successfully → employeeId={}, totalRecords={}",
         employeeId, records.size());
    }
//	private int safeGet(Integer value, int defaultValue) {
//	    return value != null ? value : defaultValue;
//	}
	
 private Map<String, Integer> calculateYearlyLimits(LocalDate joiningDate, int year) {

	    int FULL_SL = getMaxBalance("SL");
	    int FULL_EL = getMaxBalance("EL");

	    int slLimit;
	    int elLimit;

	    if (year == joiningDate.getYear()) {
	        int joiningMonth = joiningDate.getMonthValue();
	        int monthsRemaining = 12 - joiningMonth + 1;

	        slLimit = Math.min(FULL_SL, monthsRemaining * 1);
	        elLimit = Math.min(FULL_EL, monthsRemaining * 2);

	    } else {
	        slLimit = FULL_SL;
	        elLimit = FULL_EL;
	    }

	    log.debug("Yearly limits calculated → year={}, SL_LIMIT={}, EL_LIMIT={}",
	            year, slLimit, elLimit);

	    Map<String, Integer> map = new HashMap<>();
	    map.put("SL_LIMIT", slLimit);
	    map.put("EL_LIMIT", elLimit);
	    return map;
	}


 private int getMaxBalance(String leaveCode) {

	    int balance = leaveTypeRepository
	            .findByCodeIgnoreCaseAndIsActiveTrue(leaveCode)
	            .map(LeaveTypeEntity::getMaxBalance)
	            .orElse(0);

	    log.debug("Max balance fetched → leaveCode={}, maxBalance={}", leaveCode, balance);

	    return balance;
	}
 @Transactional
 public Map<String, Integer> getEmployeeLeaves(UUID employeeId) {

     log.info("Fetching employee leave balances → employeeId={}", employeeId);

     if (employeeId == null) {
         log.warn("EmployeeId is null, returning empty leave map");
         return Collections.emptyMap();
     }

     // Fetch all records
     List<AttendanceEntity> records =
             attendanceRepository.findByEmployee_IdOrderByDateAsc(employeeId);

     if (records.isEmpty()) {
         log.warn("No attendance records found for employeeId={}", employeeId);
         return Collections.emptyMap();
     }

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

     log.debug(
         "Used leaves → EL={}, SL={}, Holidays={}, Optional={}, Extra={}, Maternity={}, Paternity={}",
         usedEL, usedSL, usedHolidays, usedOptional, usedExtra, usedMat, usedPat
     );

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

     log.info("Leave balance calculation completed → employeeId={}", employeeId);

     return map;
 }

	private int safe(Integer v) {
	    return v != null ? v : 0;
	}

	public void releaseWeeklyAttendance(UUID employeeId, LocalDate weekStart, LocalDate weekEnd, String employeeName) {
		// TODO Auto-generated method stub
		
	}

	public List<AttendanceEntity> getAttendanceForMonthRange(UUID employeeId, LocalDate start, LocalDate end) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<AttendanceEntity> getAttendanceForWeek(UUID employeeId, UUID projectId, LocalDate weekStart) {
		// TODO Auto-generated method stub
		return null;
	}

	
}