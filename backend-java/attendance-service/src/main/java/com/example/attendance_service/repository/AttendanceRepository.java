package com.example.attendance_service.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.attendance_service.model.AttendanceEntity;


@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceEntity, UUID> {
	

    // ✅ check if attendance already exists for a given employee + date
    boolean existsByEmployee_IdAndDate(UUID employeeId, LocalDate date);
    
    boolean existsByEmployee_IdAndProjectIsNull(UUID employeeId);
	List<AttendanceEntity> findByEmployee_IdOrderByDateAsc(UUID employeeId);

	List<AttendanceEntity> findByProject_IdOrderByDateAsc(UUID projectId);
	AttendanceEntity findTopByEmployee_IdOrderByDateDesc(UUID employeeId);

	

	List<AttendanceEntity> findByEmployee_IdAndProject_IdOrderByDateAsc(UUID employeeId, UUID projectId);


	 Optional<AttendanceEntity> findByEmployee_IdAndProject_IdAndDate(UUID employeeId, UUID projectId, LocalDate date);

	 
	List<AttendanceEntity> findAllByOrderByDateAsc();
	List<AttendanceEntity> findByEmployee_IdAndDateBetween(UUID employeeId, LocalDate startDate, LocalDate endDate);

	
	
	List<AttendanceEntity> findByEmployee_IdAndProject_IdAndDateBetween(
		    UUID employeeId,
		    UUID projectId,
		    LocalDate startDate,
		    LocalDate endDate
		);
	
	long countByEmployee_IdAndLeaveType(UUID employeeId, String leaveType);
	
	Optional<AttendanceEntity> findByEmployee_IdAndProjectIsNull(UUID employeeId);

	// ✅ Checks if leaves are already initialized for that employee in a specific year
	@Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
	       "FROM AttendanceEntity a " +
	       "WHERE a.employee.id = :employeeId " +
	       "AND EXTRACT(YEAR FROM a.date) = :year " +
	       "AND COALESCE(a.sl, 0) > :value")
	boolean existsByEmployee_IdAndYearAndSlGreaterThan(
	        @Param("employeeId") UUID employeeId,
	        @Param("year") int year,
	        @Param("value") int value);

	// ✅ Fetch last approved record for carrying balances
	Optional<AttendanceEntity> findTopByEmployee_IdAndStatusOrderByDateDesc(UUID employeeId, String status);

	// ✅ Find last approved attendance BEFORE a given date
	
	@Query("SELECT a FROM AttendanceEntity a " +
		       "WHERE a.employee.id = :employeeId " +
		       "AND a.status = 'approved' " +          // 👈 NOTE: 'status', NOT 'weekly_status'
		       "AND a.date < :beforeDate " +
		       "ORDER BY a.date DESC")
		List<AttendanceEntity> findLastApprovedBeforeDate(
		    @Param("employeeId") UUID employeeId,
		    @Param("beforeDate") LocalDate beforeDate
		);

    @Query("SELECT COUNT(a) FROM AttendanceEntity a WHERE a.employee.id = :employeeId " +
            "AND YEAR(a.date) = :year AND MONTH(a.date) = :month " +
            "AND a.leaveType = :leaveType")
    long countByEmployeeIdAndMonthAndLeaveType(
            @Param("employeeId") UUID employeeId,
            @Param("year") int year,
            @Param("month") int month,
            @Param("leaveType") String leaveType
    );
}
