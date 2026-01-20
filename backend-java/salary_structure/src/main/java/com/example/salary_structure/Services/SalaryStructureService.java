//package com.example.salary_structure.Services;
//
//import com.example.salary_structure.Entity.SalaryStructure;
//import com.example.salary_structure.Repository.SalaryStructureRepository;
//import lombok.RequiredArgsConstructor;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.math.BigDecimal;
//import java.time.Month;
//import java.time.YearMonth;
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//public class SalaryStructureService {
//@Autowired
//    private  SalaryStructureRepository repository;
//
//    private BigDecimal safe(BigDecimal v) {
//        return v == null ? BigDecimal.ZERO : v;
//    }
//
//    private int convertMonthToNumber(String name) {
//        try { return Month.valueOf(name.toUpperCase()).getValue(); }
//        catch (Exception e) {
//            return Month.valueOf(name.substring(0, 3).toUpperCase()).getValue();
//        }
//    }
//
//    private int getDays(int y, int m) {
//        return YearMonth.of(y, m).lengthOfMonth();
//    }
//
//    public SalaryStructure getLastSalary(UUID employeeId) {
//        return repository.findTopByEmployeeIdOrderByEffectiveFromDesc(employeeId);
//    }
//
//    public SalaryStructure createSalaryStructure(SalaryStructure salary) {
//
//        // Set month/year automatically
//        if (salary.getEffectiveFrom() != null) {
//            if (salary.getMonth() == null) {
//                salary.setMonth(salary.getEffectiveFrom().getMonth().toString());
//            }
//            if (salary.getYear() == null) {
//                salary.setYear(salary.getEffectiveFrom().getYear());
//            }
//        }
//
//        // Get previous month data
//        SalaryStructure previous = repository
//                .findTopByEmployeeIdOrderByEffectiveFromDesc(salary.getEmployeeId());
//
//        if (previous != null) {
//
//            if (salary.getLocation() == null)  salary.setLocation(previous.getLocation());
//            if (salary.getPanNumber() == null) salary.setPanNumber(previous.getPanNumber());
//            if (salary.getPfNumber() == null)  salary.setPfNumber(previous.getPfNumber());
//            if (salary.getUanNumber() == null) salary.setUanNumber(previous.getUanNumber());
//            if (salary.getTaxRegime() == null) salary.setTaxRegime(previous.getTaxRegime());
//            if (salary.getPayGroup() == null)  salary.setPayGroup(previous.getPayGroup());
//            if (salary.getOcm() == null)       salary.setOcm(previous.getOcm());
//
//            if (salary.getAccountNumber() == null) salary.setAccountNumber(previous.getAccountNumber());
//            if (salary.getIfscCode() == null)      salary.setIfscCode(previous.getIfscCode());
//            if (salary.getBankName() == null)      salary.setBankName(previous.getBankName());
//            if (salary.getPaymentMethod() == null) salary.setPaymentMethod(previous.getPaymentMethod());
//
//            if (salary.getBasicPay() == null)             salary.setBasicPay(previous.getBasicPay());
//            if (salary.getHra() == null)                  salary.setHra(previous.getHra());
//            if (salary.getDa() == null)                   salary.setDa(previous.getDa());
//            if (salary.getConveyanceAllowance() == null)  salary.setConveyanceAllowance(previous.getConveyanceAllowance());
//            if (salary.getMedicalAllowance() == null)     salary.setMedicalAllowance(previous.getMedicalAllowance());
//            if (salary.getSpecialAllowance() == null)     salary.setSpecialAllowance(previous.getSpecialAllowance());
//            if (salary.getOtherAllowances() == null)      salary.setOtherAllowances(previous.getOtherAllowances());
//        }
//
//        // Standard days auto
//        int monthNum = convertMonthToNumber(salary.getMonth());
//        int days = getDays(salary.getYear(), monthNum);
//        salary.setStandardDays(BigDecimal.valueOf(days));
//
//        // Payable days
//        BigDecimal payable = salary.getStandardDays()
//                .subtract(safe(salary.getLossOfDays()))
//                .add(safe(salary.getLossOfPayReversalDays()));
//
//        salary.setPayableDays(payable);
//
//        // Gross salary
//        BigDecimal gross =
//                safe(salary.getBasicPay())
//                        .add(safe(salary.getHra()))
//                        .add(safe(salary.getDa()))
//                        .add(safe(salary.getConveyanceAllowance()))
//                        .add(safe(salary.getMedicalAllowance()))
//                        .add(safe(salary.getSpecialAllowance()))
//                        .add(safe(salary.getOtherAllowances()));
//
//        salary.setGrossSalary(gross);
//
//        // Total deductions
//        BigDecimal deduct =
//                safe(salary.getPfEmployee())
//                        .add(safe(salary.getEsi()))
//                        .add(safe(salary.getProfessionalTax()))
//                        .add(safe(salary.getIncomeTax()))
//                        .add(safe(salary.getLoanDeduction()))
//                        .add(safe(salary.getOtherDeductions()));
//
//        salary.setTotalDeductions(deduct);
//
//        // Net salary
//        salary.setNetSalary(gross.subtract(deduct));
//
//        return repository.save(salary);
//    }
//
//    public SalaryStructure getById(UUID id) {
//        return repository.findById(id).orElse(null);
//    }
//    
//    public SalaryStructure getSalaryForMonth(UUID employeeId, String monthStr, Integer year) {
//        if (employeeId == null || monthStr == null || year == null) {
//            return null;
//        }
//
//        String normalizedMonth;
//        try {
//            int m = Integer.parseInt(monthStr);
//            normalizedMonth = java.time.Month.of(m).name(); // OCTOBER
//        } catch (NumberFormatException ex) {
//            normalizedMonth = monthStr.toUpperCase();
//        }
//
//        return repository
//                .findFirstByEmployeeIdAndMonthIgnoreCaseAndYearOrderByCreatedAtDesc(
//                        employeeId, normalizedMonth, year)
//                .orElse(null);
//    }
//
//}

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

    // ✅ ADDED CONSTRUCTOR (THIS FIXES THE ERROR)
    public SalaryStructureService(SalaryStructureRepository repository) {
        this.repository = repository;
    }

    private BigDecimal safe(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private int convertMonthToNumber(String name) {
        try {
            return Month.valueOf(name.toUpperCase()).getValue();
        } catch (Exception e) {
            return Month.valueOf(name.substring(0, 3).toUpperCase()).getValue();
        }
    }

    private int getDays(int y, int m) {
        return YearMonth.of(y, m).lengthOfMonth();
    }

    // ================= LAST SALARY =================
    public SalaryStructure getLastSalary(UUID employeeId) {
        log.info("Fetching last salary for employeeId={}", employeeId);
        return repository.findTopByEmployeeIdOrderByEffectiveFromDesc(employeeId);
    }

    // ================= CREATE SALARY =================
    public SalaryStructure createSalaryStructure(SalaryStructure salary) {

        log.info("Creating salary structure for employeeId={}", salary.getEmployeeId());

        // Set month/year automatically
        if (salary.getEffectiveFrom() != null) {
            if (salary.getMonth() == null) {
                salary.setMonth(salary.getEffectiveFrom().getMonth().toString());
            }
            if (salary.getYear() == null) {
                salary.setYear(salary.getEffectiveFrom().getYear());
            }
        }

        // Get previous month data
        SalaryStructure previous =
                repository.findTopByEmployeeIdOrderByEffectiveFromDesc(
                        salary.getEmployeeId());

        if (previous != null) {

            if (salary.getLocation() == null)  salary.setLocation(previous.getLocation());
            if (salary.getPanNumber() == null) salary.setPanNumber(previous.getPanNumber());
            if (salary.getPfNumber() == null)  salary.setPfNumber(previous.getPfNumber());
            if (salary.getUanNumber() == null) salary.setUanNumber(previous.getUanNumber());
            if (salary.getTaxRegime() == null) salary.setTaxRegime(previous.getTaxRegime());
            if (salary.getPayGroup() == null)  salary.setPayGroup(previous.getPayGroup());
            if (salary.getOcm() == null)       salary.setOcm(previous.getOcm());

            if (salary.getAccountNumber() == null) salary.setAccountNumber(previous.getAccountNumber());
            if (salary.getIfscCode() == null)      salary.setIfscCode(previous.getIfscCode());
            if (salary.getBankName() == null)      salary.setBankName(previous.getBankName());
            if (salary.getPaymentMethod() == null) salary.setPaymentMethod(previous.getPaymentMethod());

            if (salary.getBasicPay() == null)            salary.setBasicPay(previous.getBasicPay());
            if (salary.getHra() == null)                 salary.setHra(previous.getHra());
            if (salary.getDa() == null)                  salary.setDa(previous.getDa());
            if (salary.getConveyanceAllowance() == null) salary.setConveyanceAllowance(previous.getConveyanceAllowance());
            if (salary.getMedicalAllowance() == null)    salary.setMedicalAllowance(previous.getMedicalAllowance());
            if (salary.getSpecialAllowance() == null)    salary.setSpecialAllowance(previous.getSpecialAllowance());
            if (salary.getOtherAllowances() == null)     salary.setOtherAllowances(previous.getOtherAllowances());
        }

        // Standard days auto
        int monthNum = convertMonthToNumber(salary.getMonth());
        int days = getDays(salary.getYear(), monthNum);
        salary.setStandardDays(BigDecimal.valueOf(days));

        // Payable days
        BigDecimal payable =
                salary.getStandardDays()
                        .subtract(safe(salary.getLossOfDays()))
                        .add(safe(salary.getLossOfPayReversalDays()));

        salary.setPayableDays(payable);

        // Gross salary
        BigDecimal gross =
                safe(salary.getBasicPay())
                        .add(safe(salary.getHra()))
                        .add(safe(salary.getDa()))
                        .add(safe(salary.getConveyanceAllowance()))
                        .add(safe(salary.getMedicalAllowance()))
                        .add(safe(salary.getSpecialAllowance()))
                        .add(safe(salary.getOtherAllowances()));

        salary.setGrossSalary(gross);

        // Total deductions
        BigDecimal deduct =
                safe(salary.getPfEmployee())
                        .add(safe(salary.getEsi()))
                        .add(safe(salary.getProfessionalTax()))
                        .add(safe(salary.getIncomeTax()))
                        .add(safe(salary.getLoanDeduction()))
                        .add(safe(salary.getOtherDeductions()));

        salary.setTotalDeductions(deduct);

        // Net salary
        salary.setNetSalary(gross.subtract(deduct));

        SalaryStructure saved = repository.save(salary);

        log.info("Salary structure saved successfully for employeeId={}",
                salary.getEmployeeId());

        return saved;
    }

    // ================= GET BY ID =================
    public SalaryStructure getById(UUID id) {
        log.debug("Fetching salary by id={}", id);
        return repository.findById(id).orElse(null);
    }

    // ================= GET BY MONTH =================
    public SalaryStructure getSalaryForMonth(UUID employeeId, String monthStr, Integer year) {

        log.info("Fetching salary for employeeId={}, month={}, year={}",
                employeeId, monthStr, year);

        if (employeeId == null || monthStr == null || year == null) {
            log.warn("Invalid input for salary fetch");
            return null;
        }

        String normalizedMonth;
        try {
            int m = Integer.parseInt(monthStr);
            normalizedMonth = Month.of(m).name();
        } catch (NumberFormatException ex) {
            normalizedMonth = monthStr.toUpperCase();
        }

        return repository
                .findFirstByEmployeeIdAndMonthIgnoreCaseAndYearOrderByCreatedAtDesc(
                        employeeId, normalizedMonth, year)
                .orElse(null);
    }
}
