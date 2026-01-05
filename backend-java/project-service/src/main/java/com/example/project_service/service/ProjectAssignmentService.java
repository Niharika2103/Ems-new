//package com.example.project_service.service;
//
//import com.example.project_service.model.ProjectAssignmentEntity;
//import com.example.project_service.model.Projects;
//import com.example.project_service.dto.ProjectAssignmentDTO;
//import com.example.project_service.repository.ProjectAssignmentRepository;
//import com.example.project_service.repository.ProjectRepository;
//import org.springframework.stereotype.Service;
//import java.util.List;
//import java.util.stream.Collectors;
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Service
//public class ProjectAssignmentService {
//
//    private final ProjectAssignmentRepository assignmentRepository;
//    private final ProjectRepository projectRepository;
//
//    // Manual constructor for dependency injection
//    public ProjectAssignmentService(ProjectAssignmentRepository assignmentRepository,
//                                    ProjectRepository projectRepository) {
//        this.assignmentRepository = assignmentRepository;
//        this.projectRepository = projectRepository;
//    }
//
//    public ProjectAssignmentEntity assignProjectToEmployee(UUID projectId, UUID employeeId, String role ,String employee_type) {
//        Projects project = projectRepository.findById(projectId)
//                .orElseThrow(() -> new RuntimeException("Project not found"));
//
//        // Build entity manually without Lombok
//        ProjectAssignmentEntity assignment = new ProjectAssignmentEntity();
//        assignment.setEmployeeId(employeeId);
//        assignment.setProject(project);
//        assignment.setEmployee_type(employee_type);
//        assignment.setRole(role);
//        assignment.setAssignedAt(LocalDateTime.now());
//
//
//        return assignmentRepository.save(assignment);
//    }
//    
//    public List<ProjectAssignmentEntity> getProjectsByEmployeeId(UUID employeeId) {
//        return assignmentRepository.findByEmployeeId(employeeId);
//    }
//    
//    public List<ProjectAssignmentDTO> getAllAssignments() {
//        return assignmentRepository.findAll().stream().map(a -> {
//            Projects project = a.getProject();
//            String employeeName = assignmentRepository.findEmployeeNameById(a.getEmployeeId());
//
//            return new ProjectAssignmentDTO(
//                    project.getId(),
//                    project.getName(),
//                    project.getDescription(),
//                    a.getEmployeeId(),
//                    employeeName,
//                    a.getRole(),
//                    a.getAssignedAt()
//            );
//        }).collect(Collectors.toList());
//    }
//
//}


package com.example.project_service.service;

import com.example.project_service.dto.ProjectAssignmentDTO;
import com.example.project_service.model.ProjectAssignmentEntity;
import com.example.project_service.model.Projects;
import com.example.project_service.repository.ProjectAssignmentRepository;
import com.example.project_service.repository.ProjectRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectAssignmentService {

    private final ProjectAssignmentRepository assignmentRepository;
    private final ProjectRepository projectRepository;

    public ProjectAssignmentService(
            ProjectAssignmentRepository assignmentRepository,
            ProjectRepository projectRepository
    ) {
        this.assignmentRepository = assignmentRepository;
        this.projectRepository = projectRepository;
    }

    // ================= ASSIGN PROJECT =================
    public ProjectAssignmentDTO assignProjectToEmployee(
            UUID projectId,
            UUID employeeId,
            String role,
            String employee_type
    ) {

        // 🚫 BLOCK IF EMPLOYEE IS ALREADY WORKING
        boolean alreadyAssigned =
                assignmentRepository.existsByEmployeeIdAndEndDateIsNull(employeeId);

        if (alreadyAssigned) {
            throw new RuntimeException(
                    "Employee is already working on a project"
            );
        }

        Projects project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        ProjectAssignmentEntity assignment = new ProjectAssignmentEntity();
        assignment.setEmployeeId(employeeId);
        assignment.setProject(project);
        assignment.setRole(role);
        assignment.setEmployee_type(employee_type);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setEndDate(null);

        project.setStatus("IN_PROGRESS");
        projectRepository.save(project);
        assignmentRepository.save(assignment);

        return new ProjectAssignmentDTO(
                project.getId(),
                project.getName(),
                project.getDescription(),
                employeeId,
                null,
                role,
                assignment.getAssignedAt(),
                "IN_PROGRESS"
        );
    }
    // ================= ACTIVE PROJECTS (EMPLOYEE / FREELANCER) =================
    public List<ProjectAssignmentDTO> getActiveProjectsForEmployee(UUID employeeId) {

        String name =
                assignmentRepository.findEmployeeNameById(employeeId);

        final String employeeName =
                (name == null || name.isBlank())
                        ? "Employee"
                        : name;

        return assignmentRepository
                .findByEmployeeIdAndEndDateIsNull(employeeId)
                .stream()
                .map(a -> new ProjectAssignmentDTO(
                        a.getProject().getId(),
                        a.getProject().getName(),
                        null,
                        a.getEmployeeId(),
                        employeeName,      // ✅ SAFE & FINAL
                        a.getRole(),
                        a.getAssignedAt(),
                        //"IN_PROGRESS",
                        a.getProject().getStatus() 
                ))
                .collect(Collectors.toList());
    }

    // ================= ADMIN VIEW =================
    public List<ProjectAssignmentDTO> getAllAssignments() {

        return assignmentRepository.findAll().stream().map(a -> {

            Projects project = a.getProject();

            if (a.getEndDate() != null) {
                project.setStatus("COMPLETED");
                projectRepository.save(project);
            }

            String employeeName =
                    assignmentRepository.findEmployeeNameById(a.getEmployeeId());

            return new ProjectAssignmentDTO(
                    project.getId(),
                    project.getName(),
                    project.getDescription(),
                    a.getEmployeeId(),
                    employeeName,
                    a.getRole(),
                    a.getAssignedAt(),
                    project.getStatus()
            );

        }).collect(Collectors.toList());
    }

    // ================= FINISH PROJECT =================
    public void finishProjectByProjectId(UUID projectId) {

        ProjectAssignmentEntity assignment =
                assignmentRepository.findByProject_Id(projectId)
                        .stream()
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException("Assignment not found"));

        Projects project = assignment.getProject();

        if ("COMPLETED".equalsIgnoreCase(project.getStatus())) {
            throw new RuntimeException("Project already completed");
        }

        project.setStatus("COMPLETED");
        projectRepository.save(project);

        assignment.setEndDate(LocalDateTime.now());
        assignmentRepository.save(assignment);
    }
}

