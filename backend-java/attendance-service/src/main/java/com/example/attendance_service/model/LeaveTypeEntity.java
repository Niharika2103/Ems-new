package com.example.attendance_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "leave_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String code;   // SL, EL

    @Column(nullable = false, length = 20)
    private String category;   // Paid / Unpaid

    @Column(name = "accrual_type", nullable = false, length = 20)
    private String accrualType; // Monthly / Yearly

    public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getAccrualType() {
		return accrualType;
	}

	public void setAccrualType(String accrualType) {
		this.accrualType = accrualType;
	}

	public Integer getMaxBalance() {
		return maxBalance;
	}

	public void setMaxBalance(Integer maxBalance) {
		this.maxBalance = maxBalance;
	}

	public Boolean getCarryForward() {
		return carryForward;
	}

	public void setCarryForward(Boolean carryForward) {
		this.carryForward = carryForward;
	}

	public Boolean getRequiresCertificate() {
		return requiresCertificate;
	}

	public void setRequiresCertificate(Boolean requiresCertificate) {
		this.requiresCertificate = requiresCertificate;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	@Column(name = "max_balance")
    private Integer maxBalance;   // 🔥 THIS replaces 10, 25, etc.

    @Column(name = "carry_forward")
    private Boolean carryForward = false;

    @Column(name = "requires_certificate")
    private Boolean requiresCertificate = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
