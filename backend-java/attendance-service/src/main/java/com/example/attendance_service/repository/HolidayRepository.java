package com.example.attendance_service.repository;

import com.example.attendance_service.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, UUID> {

    boolean existsByNameIgnoreCaseAndDate(String name, LocalDate date);

    List<Holiday> findByYearOrderByDateAsc(int year);
}
