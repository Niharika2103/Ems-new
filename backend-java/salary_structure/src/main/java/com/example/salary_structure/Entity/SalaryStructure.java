package com.example.salary_structure.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "salary_structure")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructure {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    private UUID employeeId;
    private String location;
    private String panNumber;

    private String aadharLinkStatus = "Pending";
    private String pfNumber;
    private String uanNumber;
    private String taxRegime;
    private String payGroup;
    private String ocm;

    private String accountNumber;
    private String ifscCode;

    @UuidGenerator
    private UUID accHolderId;

    private String bankName;
    private String paymentMethod = "Bank Transfer";

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    private String status = "Active";

    private BigDecimal basicPay;
    private BigDecimal hra = BigDecimal.ZERO;
    private BigDecimal da = BigDecimal.ZERO;
    private BigDecimal conveyanceAllowance = BigDecimal.ZERO;
    private BigDecimal medicalAllowance = BigDecimal.ZERO;
    private BigDecimal specialAllowance = BigDecimal.ZERO;
    private BigDecimal otherAllowances = BigDecimal.ZERO;

    private BigDecimal pfEmployee = BigDecimal.ZERO;
    private BigDecimal pfEmployer = BigDecimal.ZERO;
    private BigDecimal esi = BigDecimal.ZERO;
    private BigDecimal professionalTax = BigDecimal.ZERO;
    private BigDecimal incomeTax = BigDecimal.ZERO;
    private BigDecimal loanDeduction = BigDecimal.ZERO;
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    private BigDecimal standardDays = BigDecimal.ZERO;
    private BigDecimal daysWorked = BigDecimal.ZERO;
    private BigDecimal lossOfDays = BigDecimal.ZERO;
    private BigDecimal lossOfPayReversalDays = BigDecimal.ZERO;

    private BigDecimal payableDays;
    private BigDecimal grossSalary;
    private BigDecimal totalDeductions;
    private BigDecimal netSalary;

    private ZonedDateTime createdAt = ZonedDateTime.now();
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    private Integer year;
    private String month;

    private LocalDate joiningDate;
}
