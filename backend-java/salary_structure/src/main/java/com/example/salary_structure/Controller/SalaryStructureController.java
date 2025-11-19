package com.example.salary_structure.Controller;

import com.example.salary_structure.Entity.SalaryStructure;
import com.example.salary_structure.Services.SalaryStructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/salary-structure")
@RequiredArgsConstructor
public class SalaryStructureController {

    private final SalaryStructureService service;

    @PostMapping
    public SalaryStructure create(@RequestBody SalaryStructure salary) {
        return service.createSalaryStructure(salary);
    }
}

