package com.example.salary_structure.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
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

    @Column(name = "employee_id")
    private UUID employeeId;

    private String location;

    @Column(name = "pan_number")
    private String panNumber;

    // DB DEFAULT = 'Pending'
    @Column(name = "aadhar_link_status", insertable = false, updatable = false)
    private String aadharLinkStatus;

    @Column(name = "pf_number")
    private String pfNumber;

    @Column(name = "uan_number")
    private String uanNumber;

    @Column(name = "tax_regime")
    private String taxRegime;

    @Column(name = "pay_group")
    private String payGroup;

    private String ocm;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "ifsc_code")
    private String ifscCode;

    // DB generates UUID
    @Column(name = "acc_holder_id", insertable = false, updatable = false)
    private UUID accHolderId;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    private String status;

    @Column(name = "basic_pay")
    private BigDecimal basicPay;

    private BigDecimal hra;

    private BigDecimal da;

    @Column(name = "conveyance_allowance")
    private BigDecimal conveyanceAllowance;

    @Column(name = "medical_allowance")
    private BigDecimal medicalAllowance;

    @Column(name = "special_allowance")
    private BigDecimal specialAllowance;

    @Column(name = "other_allowances")
    private BigDecimal otherAllowances;

    @Column(name = "pf_employee")
    private BigDecimal pfEmployee;

    @Column(name = "pf_employer")
    private BigDecimal pfEmployer;

    private BigDecimal esi;

    @Column(name = "professional_tax")
    private BigDecimal professionalTax;

    @Column(name = "income_tax")
    private BigDecimal incomeTax;

    @Column(name = "loan_deduction")
    private BigDecimal loanDeduction;

    @Column(name = "other_deductions")
    private BigDecimal otherDeductions;

    @Column(name = "standard_days")
    private BigDecimal standardDays;

    @Column(name = "days_worked")
    private BigDecimal daysWorked;

    @Column(name = "loss_of_days")
    private BigDecimal lossOfDays;

    @Column(name = "loss_of_pay_reversal_days")
    private BigDecimal lossOfPayReversalDays;

    @Column(name = "payable_days")
    private BigDecimal payableDays;

    @Column(name = "gross_salary")
    private BigDecimal grossSalary;

    @Column(name = "total_deductions")
    private BigDecimal totalDeductions;

    @Column(name = "net_salary")
    private BigDecimal netSalary;

    // MUST BE OffsetDateTime for timestamptz
    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    private Integer year;
    private String month;

    @Column(name = "joining_date")
    private LocalDate joiningDate;
}
