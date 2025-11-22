package com.example.salary_structure.Controller;

import com.example.salary_structure.Entity.SalaryStructure;
import com.example.salary_structure.Services.SalaryStructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/salary")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalaryStructureController {

    private final SalaryStructureService service;

    // frontend autofill purpose
    @GetMapping("/last/{employeeId}")
    public SalaryStructure getLastMonth(@PathVariable UUID employeeId) {
        return service.getLastSalary(employeeId);  // ✅ Correct method
    }

    // create new salary
    @PostMapping("/create")
    public SalaryStructure createSalary(@RequestBody SalaryStructure salary) {
        return service.createSalaryStructure(salary);
    }
}
