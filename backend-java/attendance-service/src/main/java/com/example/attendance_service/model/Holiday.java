package com.example.attendance_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "holidays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Holiday {

    @Id
    @GeneratedValue
    private UUID id;

    private String name;
    private LocalDate date;
    private int year;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "holiday_type")
    private String holidayType;

    @Column(name = "is_optional")
    private boolean isOptional;

    private String source;
    private String country;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
