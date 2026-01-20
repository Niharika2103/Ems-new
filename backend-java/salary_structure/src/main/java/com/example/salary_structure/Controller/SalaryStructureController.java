//package com.example.salary_structure.Controller;
//import java.io.ByteArrayInputStream;
//import java.util.UUID;
//
//
//
//import com.example.salary_structure.Entity.SalaryStructure;
//import com.example.salary_structure.Services.PdfGeneratorService;
//import com.example.salary_structure.Services.SalaryStructureService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.io.ByteArrayInputStream;
//import java.util.UUID;
//import com.example.salary_structure.Services.SalaryStructureService;
//import lombok.RequiredArgsConstructor;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/salary")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class SalaryStructureController {
//
//@Autowired
//private  SalaryStructureService salaryStructureService;
//@Autowired
//private  PdfGeneratorService pdfGeneratorService;
//
//    // frontend autofill purpose
//    @GetMapping("/last/{employeeId}")
//    public SalaryStructure getLastMonth(@PathVariable UUID employeeId) {
//        return salaryStructureService.getLastSalary(employeeId);  // ✅ Correct method
//    }
//
//    // create new salary
//    @PostMapping("/create")
//    public SalaryStructure createSalary(@RequestBody SalaryStructure salary) {
//        return salaryStructureService.createSalaryStructure(salary);
//    }
//    
//    
//    @GetMapping("/download/{employeeId}/{month}/{year}")
//    public ResponseEntity<byte[]> downloadPayslipByMonthYear(
//            @PathVariable UUID employeeId,
//            @PathVariable String month,
//            @PathVariable Integer year) {
//
//        SalaryStructure salary = salaryStructureService.getSalaryForMonth(employeeId, month, year);
//
//        if (salary == null) {
//            return ResponseEntity.notFound().build();
//        }
//
//        ByteArrayInputStream pdf = pdfGeneratorService.generatePayslip(salary);
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.add(
//                "Content-Disposition",
//                "attachment; filename=payslip_" + employeeId + "_" + month + "_" + year + ".pdf"
//        );
//
//        return ResponseEntity.ok()
//                .headers(headers)
//                .contentType(MediaType.APPLICATION_PDF)
//                .body(pdf.readAllBytes());
//    }
//
//}


package com.example.salary_structure.Controller;

import java.io.ByteArrayInputStream;
import java.util.UUID;

import com.example.salary_structure.Entity.SalaryStructure;
import com.example.salary_structure.Services.PdfGeneratorService;
import com.example.salary_structure.Services.SalaryStructureService;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/salary")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalaryStructureController {

    private static final Logger log =
            LoggerFactory.getLogger(SalaryStructureController.class);

    private final SalaryStructureService salaryStructureService;
    private final PdfGeneratorService pdfGeneratorService;

    // ✅ ADDED CONSTRUCTOR (SAFE FIX – DOES NOT CHANGE LOGIC)
    public SalaryStructureController(
            SalaryStructureService salaryStructureService,
            PdfGeneratorService pdfGeneratorService
    ) {
        this.salaryStructureService = salaryStructureService;
        this.pdfGeneratorService = pdfGeneratorService;
    }

    // ================= LAST MONTH SALARY =================
    @GetMapping("/last/{employeeId}")
    public SalaryStructure getLastMonth(@PathVariable UUID employeeId) {
        log.info("Fetching last salary for employeeId={}", employeeId);
        return salaryStructureService.getLastSalary(employeeId);
    }

    // ================= CREATE SALARY =================
    @PostMapping("/create")
    public SalaryStructure createSalary(@RequestBody SalaryStructure salary) {
        log.info("Creating salary structure for employeeId={}", salary.getEmployeeId());
        return salaryStructureService.createSalaryStructure(salary);
    }

    // ================= DOWNLOAD PAYSLIP =================
    @GetMapping("/download/{employeeId}/{month}/{year}")
    public ResponseEntity<byte[]> downloadPayslipByMonthYear(
            @PathVariable UUID employeeId,
            @PathVariable String month,
            @PathVariable Integer year) {

        log.info("Downloading payslip for employeeId={}, month={}, year={}",
                employeeId, month, year);

        SalaryStructure salary =
                salaryStructureService.getSalaryForMonth(employeeId, month, year);

        if (salary == null) {
            log.warn("No salary found for employeeId={}, month={}, year={}",
                    employeeId, month, year);
            return ResponseEntity.notFound().build();
        }

        ByteArrayInputStream pdf =
                pdfGeneratorService.generatePayslip(salary);

        HttpHeaders headers = new HttpHeaders();
        headers.add(
                "Content-Disposition",
                "attachment; filename=payslip_" +
                        employeeId + "_" + month + "_" + year + ".pdf"
        );

        log.info("Payslip generated successfully for employeeId={}", employeeId);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf.readAllBytes());
    }
}
