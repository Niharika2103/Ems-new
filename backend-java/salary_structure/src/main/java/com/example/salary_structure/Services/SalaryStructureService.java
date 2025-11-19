package com.example.salary_structure.Services;

import com.example.salary_structure.Entity.SalaryStructure;
import com.example.salary_structure.Repository.SalaryStructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Month;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class SalaryStructureService {

    private final SalaryStructureRepository repository;

    // Null-safety helper
    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    // Convert January → 1, Feb → 2, etc.
    private int convertMonthToNumber(String monthName) {
        try {
            return Month.valueOf(monthName.toUpperCase()).getValue();
        } catch (Exception e) {
            return Month.valueOf(monthName.substring(0, 3).toUpperCase()).getValue();
        }
    }

    // Get number of days in that month/year
    private int getDaysInMonth(int year, int monthNumber) {
        return YearMonth.of(year, monthNumber).lengthOfMonth();
    }

    public SalaryStructure createSalaryStructure(SalaryStructure salary) {

        // 🔥 AUTO-SET month & year from effectiveFrom
        if (salary.getEffectiveFrom() != null) {

            if (salary.getMonth() == null) {
                salary.setMonth(salary.getEffectiveFrom().getMonth().toString());
            }

            if (salary.getYear() == null) {
                salary.setYear(salary.getEffectiveFrom().getYear());
            }
        }

        // Validate
        if (salary.getMonth() == null || salary.getYear() == null) {
            throw new RuntimeException("Month and Year are required. Or set effectiveFrom.");
        }

        // Convert month to number
        int monthNumber = convertMonthToNumber(salary.getMonth());

        // AUTO-SET standardDays
        int daysInMonth = getDaysInMonth(salary.getYear(), monthNumber);
        salary.setStandardDays(BigDecimal.valueOf(daysInMonth));

        // Payable Days
        BigDecimal payableDays = salary.getStandardDays()
                .subtract(safe(salary.getLossOfDays()))
                .add(safe(salary.getLossOfPayReversalDays()));
        salary.setPayableDays(payableDays);

        // Gross Salary
        BigDecimal grossSalary =
                safe(salary.getBasicPay())
                        .add(safe(salary.getHra()))
                        .add(safe(salary.getDa()))
                        .add(safe(salary.getConveyanceAllowance()))
                        .add(safe(salary.getMedicalAllowance()))
                        .add(safe(salary.getSpecialAllowance()))
                        .add(safe(salary.getOtherAllowances()));
        salary.setGrossSalary(grossSalary);

        // Total Deductions
        BigDecimal totalDeductions =
                safe(salary.getPfEmployee())
                        .add(safe(salary.getEsi()))
                        .add(safe(salary.getProfessionalTax()))
                        .add(safe(salary.getIncomeTax()))
                        .add(safe(salary.getLoanDeduction()))
                        .add(safe(salary.getOtherDeductions()));
        salary.setTotalDeductions(totalDeductions);

        // Net Salary
        salary.setNetSalary(grossSalary.subtract(totalDeductions));

        return repository.save(salary);
    }
}
