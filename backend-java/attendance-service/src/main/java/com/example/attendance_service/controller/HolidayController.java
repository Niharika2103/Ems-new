package com.example.attendance_service.controller;

import com.example.attendance_service.model.Holiday;
import com.example.attendance_service.service.HolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/holidays")
//@RequiredArgsConstructor   // ✅ Lombok auto-generates constructor for final fields
public class HolidayController {

	 private final HolidayService service;
//3rd party api store in db
	    public HolidayController(HolidayService service) {
	        this.service = service;  // ✅ manual injection constructor
	    }
    @PostMapping("/fetch/{start}/{end}")
    public ResponseEntity<String> fetchRange(@PathVariable int start, @PathVariable int end) {
        service.fetchAndStoreRange(start, end);
        return ResponseEntity.ok("Fetched and stored holidays from " + start + " to " + end);
    }
//fetch holidays deatils from  db
    @GetMapping("/{year}")
    public ResponseEntity<List<Holiday>> getByYear(@PathVariable int year) {
        return ResponseEntity.ok(service.getByYear(year));
    }
//admin add Extra holidays
    @PostMapping
    public ResponseEntity<Holiday> addHoliday(@RequestBody Holiday holiday) {
        return ResponseEntity.ok(service.addHoliday(holiday));
    }

    //delete Public holidays
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteHoliday(@PathVariable UUID id) {
        service.deleteHoliday(id);
        return ResponseEntity.ok("Holiday deleted");
    }
    //update public holidays
    @PutMapping("/{id}")
    public ResponseEntity<Holiday> updateHoliday(@PathVariable UUID id, @RequestBody Holiday updated) {
        return ResponseEntity.ok(service.updateHoliday(id, updated));
    }
}
