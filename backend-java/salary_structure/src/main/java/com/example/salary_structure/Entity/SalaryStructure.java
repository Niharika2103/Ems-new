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

    public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public UUID getEmployeeId() {
		return employeeId;
	}

	public void setEmployeeId(UUID employeeId) {
		this.employeeId = employeeId;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getPanNumber() {
		return panNumber;
	}

	public void setPanNumber(String panNumber) {
		this.panNumber = panNumber;
	}

	public String getAadharLinkStatus() {
		return aadharLinkStatus;
	}

	public void setAadharLinkStatus(String aadharLinkStatus) {
		this.aadharLinkStatus = aadharLinkStatus;
	}

	public String getPfNumber() {
		return pfNumber;
	}

	public void setPfNumber(String pfNumber) {
		this.pfNumber = pfNumber;
	}

	public String getUanNumber() {
		return uanNumber;
	}

	public void setUanNumber(String uanNumber) {
		this.uanNumber = uanNumber;
	}

	public String getTaxRegime() {
		return taxRegime;
	}

	public void setTaxRegime(String taxRegime) {
		this.taxRegime = taxRegime;
	}

	public String getPayGroup() {
		return payGroup;
	}

	public void setPayGroup(String payGroup) {
		this.payGroup = payGroup;
	}

	public String getOcm() {
		return ocm;
	}

	public void setOcm(String ocm) {
		this.ocm = ocm;
	}

	public String getAccountNumber() {
		return accountNumber;
	}

	public void setAccountNumber(String accountNumber) {
		this.accountNumber = accountNumber;
	}

	public String getIfscCode() {
		return ifscCode;
	}

	public void setIfscCode(String ifscCode) {
		this.ifscCode = ifscCode;
	}

	public UUID getAccHolderId() {
		return accHolderId;
	}

	public void setAccHolderId(UUID accHolderId) {
		this.accHolderId = accHolderId;
	}

	public String getBankName() {
		return bankName;
	}

	public void setBankName(String bankName) {
		this.bankName = bankName;
	}

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public LocalDate getEffectiveFrom() {
		return effectiveFrom;
	}

	public void setEffectiveFrom(LocalDate effectiveFrom) {
		this.effectiveFrom = effectiveFrom;
	}

	public LocalDate getEffectiveTo() {
		return effectiveTo;
	}

	public void setEffectiveTo(LocalDate effectiveTo) {
		this.effectiveTo = effectiveTo;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public BigDecimal getBasicPay() {
		return basicPay;
	}

	public void setBasicPay(BigDecimal basicPay) {
		this.basicPay = basicPay;
	}

	public BigDecimal getHra() {
		return hra;
	}

	public void setHra(BigDecimal hra) {
		this.hra = hra;
	}

	public BigDecimal getDa() {
		return da;
	}

	public void setDa(BigDecimal da) {
		this.da = da;
	}

	public BigDecimal getConveyanceAllowance() {
		return conveyanceAllowance;
	}

	public void setConveyanceAllowance(BigDecimal conveyanceAllowance) {
		this.conveyanceAllowance = conveyanceAllowance;
	}

	public BigDecimal getMedicalAllowance() {
		return medicalAllowance;
	}

	public void setMedicalAllowance(BigDecimal medicalAllowance) {
		this.medicalAllowance = medicalAllowance;
	}

	public BigDecimal getSpecialAllowance() {
		return specialAllowance;
	}

	public void setSpecialAllowance(BigDecimal specialAllowance) {
		this.specialAllowance = specialAllowance;
	}

	public BigDecimal getOtherAllowances() {
		return otherAllowances;
	}

	public void setOtherAllowances(BigDecimal otherAllowances) {
		this.otherAllowances = otherAllowances;
	}

	public BigDecimal getPfEmployee() {
		return pfEmployee;
	}

	public void setPfEmployee(BigDecimal pfEmployee) {
		this.pfEmployee = pfEmployee;
	}

	public BigDecimal getPfEmployer() {
		return pfEmployer;
	}

	public void setPfEmployer(BigDecimal pfEmployer) {
		this.pfEmployer = pfEmployer;
	}

	public BigDecimal getEsi() {
		return esi;
	}

	public void setEsi(BigDecimal esi) {
		this.esi = esi;
	}

	public BigDecimal getProfessionalTax() {
		return professionalTax;
	}

	public void setProfessionalTax(BigDecimal professionalTax) {
		this.professionalTax = professionalTax;
	}

	public BigDecimal getIncomeTax() {
		return incomeTax;
	}

	public void setIncomeTax(BigDecimal incomeTax) {
		this.incomeTax = incomeTax;
	}

	public BigDecimal getLoanDeduction() {
		return loanDeduction;
	}

	public void setLoanDeduction(BigDecimal loanDeduction) {
		this.loanDeduction = loanDeduction;
	}

	public BigDecimal getOtherDeductions() {
		return otherDeductions;
	}

	public void setOtherDeductions(BigDecimal otherDeductions) {
		this.otherDeductions = otherDeductions;
	}

	public BigDecimal getStandardDays() {
		return standardDays;
	}

	public void setStandardDays(BigDecimal standardDays) {
		this.standardDays = standardDays;
	}

	public BigDecimal getDaysWorked() {
		return daysWorked;
	}

	public void setDaysWorked(BigDecimal daysWorked) {
		this.daysWorked = daysWorked;
	}

	public BigDecimal getLossOfDays() {
		return lossOfDays;
	}

	public void setLossOfDays(BigDecimal lossOfDays) {
		this.lossOfDays = lossOfDays;
	}

	public BigDecimal getLossOfPayReversalDays() {
		return lossOfPayReversalDays;
	}

	public void setLossOfPayReversalDays(BigDecimal lossOfPayReversalDays) {
		this.lossOfPayReversalDays = lossOfPayReversalDays;
	}

	public BigDecimal getPayableDays() {
		return payableDays;
	}

	public void setPayableDays(BigDecimal payableDays) {
		this.payableDays = payableDays;
	}

	public BigDecimal getGrossSalary() {
		return grossSalary;
	}

	public void setGrossSalary(BigDecimal grossSalary) {
		this.grossSalary = grossSalary;
	}

	public BigDecimal getTotalDeductions() {
		return totalDeductions;
	}

	public void setTotalDeductions(BigDecimal totalDeductions) {
		this.totalDeductions = totalDeductions;
	}

	public BigDecimal getNetSalary() {
		return netSalary;
	}

	public void setNetSalary(BigDecimal netSalary) {
		this.netSalary = netSalary;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(OffsetDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public OffsetDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(OffsetDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public Integer getYear() {
		return year;
	}

	public void setYear(Integer year) {
		this.year = year;
	}

	public String getMonth() {
		return month;
	}

	public void setMonth(String month) {
		this.month = month;
	}

	public LocalDate getJoiningDate() {
		return joiningDate;
	}

	public void setJoiningDate(LocalDate joiningDate) {
		this.joiningDate = joiningDate;
	}

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
