package com.example.attendance_service.model;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_employees_master")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserEmployeeMasterEntity {

	@Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    // Optional: if you want to display EMP001 etc.
    @Column(name = "employee_id")
    private String employeeCode;
    
    @Column(name = "name", nullable = false)
    private String employeeName;
    
    @Column(name = "gender", nullable = false)
    private String gender;
    

	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
	}

	public String getEmployeeName() {
		return employeeName;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getEmployeeCode() {
		return employeeCode;
	}

	public void setEmployeeCode(String employeeCode) {
		this.employeeCode = employeeCode;
	}


    
}
