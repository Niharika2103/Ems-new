package com.example.salary_structure.Repository;

import com.example.salary_structure.Entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, UUID> {
    SalaryStructure findTopByEmployeeIdOrderByEffectiveFromDesc(UUID employeeId);

}
