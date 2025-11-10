package com.example.attendance_service.controller;

import com.example.attendance_service.model.Holiday;
import com.example.attendance_service.service.HolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/holidays")
//@RequiredArgsConstructor   // ✅ Lombok auto-generates constructor for final fields
public class HolidayController {

	 private final HolidayService service;

	    public HolidayController(HolidayService service) {
	        this.service = service;  // ✅ manual injection constructor
	    }
    @PostMapping("/fetch/{start}/{end}")
    public ResponseEntity<String> fetchRange(@PathVariable int start, @PathVariable int end) {
        service.fetchAndStoreRange(start, end);
        return ResponseEntity.ok("Fetched and stored holidays from " + start + " to " + end);
    }

    @GetMapping("/{year}")
    public ResponseEntity<List<Holiday>> getByYear(@PathVariable int year) {
        return ResponseEntity.ok(service.getByYear(year));
    }
}
