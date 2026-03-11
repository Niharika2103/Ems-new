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
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SalaryStructureController {

    private static final Logger log =
            LoggerFactory.getLogger(SalaryStructureController.class);

    private final SalaryStructureService salaryStructureService;
    private final PdfGeneratorService pdfGeneratorService;

    @GetMapping("/last/{employeeId}")
    public SalaryStructure getLastMonth(@PathVariable UUID employeeId) {
        return salaryStructureService.getLastSalary(employeeId);
    }

    @PostMapping("/create")
    public SalaryStructure createSalary(@RequestBody SalaryStructure salary) {
        return salaryStructureService.createSalaryStructure(salary);
    }

    @GetMapping("/download/{employeeId}/{month}/{year}")
    public ResponseEntity<?> downloadPayslipByMonthYear(
            @PathVariable UUID employeeId,
            @PathVariable String month,
            @PathVariable Integer year) {

        try {
            log.info("Downloading payslip for {}, {}, {}", employeeId, month, year);

            SalaryStructure salary =
                    salaryStructureService.getSalaryForMonth(employeeId, month, year);

            if (salary == null) {
                return ResponseEntity
                        .status(404)
                        .body("Payslip not available for selected month");
            }

            ByteArrayInputStream pdf =
                    pdfGeneratorService.generatePayslip(salary);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=payslip_" + month + "_" + year + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf.readAllBytes());

        } catch (Exception e) {
            log.error("Download payslip error", e);
            return ResponseEntity
                    .status(500)
                    .body("Internal Server Error: " + e.getMessage());
        }
    }
}