//package com.example.project_service.service;
//
//import com.example.project_service.dto.ProjectAssignmentDTO;
//import com.example.project_service.model.ProjectAssignmentEntity;
//import com.example.project_service.model.Projects;
//import com.example.project_service.repository.ProjectAssignmentRepository;
//import com.example.project_service.repository.ProjectRepository;
//
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.UUID;
//import java.util.stream.Collectors;
//
//@Service
//@Transactional
//public class ProjectAssignmentService {
//
//    private final ProjectAssignmentRepository assignmentRepository;
//    private final ProjectRepository projectRepository;
//
//    public ProjectAssignmentService(
//            ProjectAssignmentRepository assignmentRepository,
//            ProjectRepository projectRepository
//    ) {
//        this.assignmentRepository = assignmentRepository;
//        this.projectRepository = projectRepository;
//    }
//
//    // ================= ASSIGN PROJECT =================
//    public ProjectAssignmentDTO assignProjectToEmployee(
//            UUID projectId,
//            UUID employeeId,
//            String role,
//            String employee_type
//    ) {
//
//        // 🚫 BLOCK IF EMPLOYEE IS ALREADY WORKING
//        boolean alreadyAssigned =
//                assignmentRepository.existsByEmployeeIdAndEndDateIsNull(employeeId);
//
//        if (alreadyAssigned) {
//            throw new RuntimeException(
//                    "Employee is already working on a project"
//            );
//        }
//
//        Projects project = projectRepository.findById(projectId)
//                .orElseThrow(() -> new RuntimeException("Project not found"));
//
//        ProjectAssignmentEntity assignment = new ProjectAssignmentEntity();
//        assignment.setEmployeeId(employeeId);
//        assignment.setProject(project);
//        assignment.setRole(role);
//        assignment.setEmployee_type(employee_type);
//        assignment.setAssignedAt(LocalDateTime.now());
//        assignment.setEndDate(null);
//
//        project.setStatus("IN_PROGRESS");
//        projectRepository.save(project);
//        assignmentRepository.save(assignment);
//
//        return new ProjectAssignmentDTO(
//                project.getId(),
//                project.getName(),
//                project.getDescription(),
//                employeeId,
//                null,
//                role,
//                assignment.getAssignedAt(),
//                "IN_PROGRESS"
//        );
//    }
//    // ================= ACTIVE PROJECTS (EMPLOYEE / FREELANCER) =================
//    public List<ProjectAssignmentDTO> getActiveProjectsForEmployee(UUID employeeId) {
//
//        String name =
//                assignmentRepository.findEmployeeNameById(employeeId);
//
//        final String employeeName =
//                (name == null || name.isBlank())
//                        ? "Employee"
//                        : name;
//
//        return assignmentRepository
//                .findByEmployeeIdAndEndDateIsNull(employeeId)
//                .stream()
//                .map(a -> new ProjectAssignmentDTO(
//                        a.getProject().getId(),
//                        a.getProject().getName(),
//                        null,
//                        a.getEmployeeId(),
//                        employeeName,      // ✅ SAFE & FINAL
//                        a.getRole(),
//                        a.getAssignedAt(),
//                        //"IN_PROGRESS",
//                        a.getProject().getStatus() 
//                ))
//                .collect(Collectors.toList());
//    }
//
//    // ================= ADMIN VIEW =================
//    public List<ProjectAssignmentDTO> getAllAssignments() {
//
//        return assignmentRepository.findAll().stream().map(a -> {
//
//            Projects project = a.getProject();
//
//            if (a.getEndDate() != null) {
//                project.setStatus("COMPLETED");
//                projectRepository.save(project);
//            }
//
//            String employeeName =
//                    assignmentRepository.findEmployeeNameById(a.getEmployeeId());
//
//            return new ProjectAssignmentDTO(
//                    project.getId(),
//                    project.getName(),
//                    project.getDescription(),
//                    a.getEmployeeId(),
//                    employeeName,
//                    a.getRole(),
//                    a.getAssignedAt(),
//                    project.getStatus()
//            );
//
//        }).collect(Collectors.toList());
//    }
//
//    // ================= FINISH PROJECT =================
//    public void finishProjectByProjectId(UUID projectId) {
//
//        ProjectAssignmentEntity assignment =
//                assignmentRepository.findByProject_Id(projectId)
//                        .stream()
//                        .findFirst()
//                        .orElseThrow(() ->
//                                new RuntimeException("Assignment not found"));
//
//        Projects project = assignment.getProject();
//
//        if ("COMPLETED".equalsIgnoreCase(project.getStatus())) {
//            throw new RuntimeException("Project already completed");
//        }
//
//        project.setStatus("COMPLETED");
//        projectRepository.save(project);
//
//        assignment.setEndDate(LocalDateTime.now());
//        assignmentRepository.save(assignment);
//    }
//}
//

package com.example.project_service.service;

import com.example.project_service.dto.ProjectAssignmentDTO;
import com.example.project_service.model.ProjectAssignmentEntity;
import com.example.project_service.model.Projects;
import com.example.project_service.repository.ProjectAssignmentRepository;
import com.example.project_service.repository.ProjectRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectAssignmentService {

    private static final Logger log =
            LoggerFactory.getLogger(ProjectAssignmentService.class);

    private final ProjectAssignmentRepository assignmentRepository;
    private final ProjectRepository projectRepository;

    public ProjectAssignmentService(
            ProjectAssignmentRepository assignmentRepository,
            ProjectRepository projectRepository
    ) {
        this.assignmentRepository = assignmentRepository;
        this.projectRepository = projectRepository;
        log.info("ProjectAssignmentService initialized");
    }

    // ================= ASSIGN PROJECT =================
    public ProjectAssignmentDTO assignProjectToEmployee(
            UUID projectId,
            UUID employeeId,
            String role,
            String employee_type
    ) {

        log.info("Assigning project {} to employee {}", projectId, employeeId);

        boolean alreadyAssigned =
                assignmentRepository.existsByEmployeeIdAndEndDateIsNull(employeeId);

        if (alreadyAssigned) {
            log.warn("Employee {} is already assigned to another project", employeeId);
            throw new RuntimeException("Employee is already working on a project");
        }

        Projects project = projectRepository.findById(projectId)
                .orElseThrow(() -> {
                    log.error("Project not found with ID {}", projectId);
                    return new RuntimeException("Project not found");
                });

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

        log.info("Project {} assigned successfully to employee {}", projectId, employeeId);

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

    // ================= ACTIVE PROJECTS =================
    public List<ProjectAssignmentDTO> getActiveProjectsForEmployee(UUID employeeId) {

        log.info("Fetching active projects for employee {}", employeeId);

        String name = assignmentRepository.findEmployeeNameById(employeeId);

        final String employeeName =
                (name == null || name.isBlank()) ? "Employee" : name;

        return assignmentRepository
                .findByEmployeeIdAndEndDateIsNull(employeeId)
                .stream()
                .map(a -> new ProjectAssignmentDTO(
                        a.getProject().getId(),
                        a.getProject().getName(),
                        null,
                        a.getEmployeeId(),
                        employeeName,
                        a.getRole(),
                        a.getAssignedAt(),
                        a.getProject().getStatus()
                ))
                .collect(Collectors.toList());
    }

    // ================= ADMIN VIEW =================
    public List<ProjectAssignmentDTO> getAllAssignments() {

        log.info("Fetching all project assignments");

        return assignmentRepository.findAll().stream().map(a -> {

            Projects project = a.getProject();

            if (a.getEndDate() != null) {
                project.setStatus("COMPLETED");
                projectRepository.save(project);
                log.info("Project {} marked as COMPLETED", project.getId());
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

        log.info("Finishing project with ID {}", projectId);

        ProjectAssignmentEntity assignment =
                assignmentRepository.findByProject_Id(projectId)
                        .stream()
                        .findFirst()
                        .orElseThrow(() -> {
                            log.error("Assignment not found for project {}", projectId);
                            return new RuntimeException("Assignment not found");
                        });

        Projects project = assignment.getProject();

        if ("COMPLETED".equalsIgnoreCase(project.getStatus())) {
            log.warn("Project {} already completed", projectId);
            throw new RuntimeException("Project already completed");
        }

        project.setStatus("COMPLETED");
        projectRepository.save(project);

        assignment.setEndDate(LocalDateTime.now());
        assignmentRepository.save(assignment);

        log.info("Project {} finished successfully", projectId);
    }
}
