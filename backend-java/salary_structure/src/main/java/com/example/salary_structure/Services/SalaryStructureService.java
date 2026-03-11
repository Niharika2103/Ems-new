package com.example.salary_structure.Services;

import com.example.salary_structure.Entity.SalaryStructure;
import com.example.salary_structure.Repository.SalaryStructureRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Month;
import java.time.YearMonth;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalaryStructureService {

    private static final Logger log =
            LoggerFactory.getLogger(SalaryStructureService.class);

    private final SalaryStructureRepository repository;

    private BigDecimal safe(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    public SalaryStructure getLastSalary(UUID employeeId) {
        return repository.findTopByEmployeeIdOrderByEffectiveFromDesc(employeeId);
    }

    public SalaryStructure createSalaryStructure(SalaryStructure salary) {

        if (salary.getEffectiveFrom() != null) {
            if (salary.getMonth() == null) {
                salary.setMonth(salary.getEffectiveFrom().getMonth().name());
            }
            if (salary.getYear() == null) {
                salary.setYear(salary.getEffectiveFrom().getYear());
            }
        }

        BigDecimal gross =
                safe(salary.getBasicPay())
                        .add(safe(salary.getHra()))
                        .add(safe(salary.getDa()))
                        .add(safe(salary.getConveyanceAllowance()))
                        .add(safe(salary.getMedicalAllowance()))
                        .add(safe(salary.getSpecialAllowance()))
                        .add(safe(salary.getOtherAllowances()));

        salary.setGrossSalary(gross);

        BigDecimal deductions =
                safe(salary.getPfEmployee())
                        .add(safe(salary.getProfessionalTax()))
                        .add(safe(salary.getIncomeTax()))
                        .add(safe(salary.getLoanDeduction()));

        salary.setTotalDeductions(deductions);
        salary.setNetSalary(gross.subtract(deductions));

        return repository.save(salary);
    }

    public SalaryStructure getSalaryForMonth(UUID employeeId, String monthStr, Integer year) {

        try {
            if (employeeId == null || monthStr == null || year == null) {
                return null;
            }

            String normalizedMonth;
            try {
                int m = Integer.parseInt(monthStr);
                normalizedMonth = Month.of(m).name();
            } catch (Exception e) {
                normalizedMonth = monthStr.trim().toUpperCase();
            }

            SalaryStructure salary = repository
                    .findFirstByEmployeeIdAndMonthIgnoreCaseAndYear(
                            employeeId, normalizedMonth, year)
                    .orElse(null);

            if (salary == null) {
                log.warn("Monthly salary not found, using latest salary");
                salary = repository.findTopByEmployeeIdOrderByEffectiveFromDesc(employeeId);
            }

            return salary;

        } catch (Exception e) {
            log.error("Error fetching salary", e);
            return null;
        }
    }
}