package com.example.attendance_service.service;

import com.example.attendance_service.model.Holiday;
import com.example.attendance_service.repository.HolidayRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;

@Service
public class HolidayService {

    private final HolidayRepository repo;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${calendarific.api.key}")
    private String apiKey;

    private final List<String> allowedNames = List.of(
        "Sankranti", "Republic Day", "Maha Shivaratri", "Ugadi",
         "International Worker's Day", "Ganesh Chaturthi", "Independence Day",
        "Gandhi Jayanti", "Dussehra", "Diwali", "Christmas"
    );

    public HolidayService(HolidayRepository repo) {
        this.repo = repo;
    }

    public void fetchAndStoreRange(int startYear, int endYear) {
        for (int year = startYear; year <= endYear; year++) {
            try {
                fetchAndStoreForYear(year);
                Thread.sleep(1000);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Transactional
    public void fetchAndStoreForYear(int year) throws Exception {
        String url = "https://calendarific.com/api/v2/holidays?api_key=" + apiKey + "&country=IN&year=" + year;
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        JsonNode holidays = mapper.readTree(response.getBody()).path("response").path("holidays");

        for (JsonNode h : holidays) {
            String name = h.path("name").asText();
            if (allowedNames.stream().noneMatch(k -> name.toLowerCase().contains(k.toLowerCase()))) continue;

            LocalDate date = LocalDate.parse(h.path("date").path("iso").asText().substring(0, 10));
            if (repo.existsByNameIgnoreCaseAndDate(name, date)) continue;

            Holiday entity = Holiday.builder()
                    .name(name)
                    .date(date)
                    .year(year)
                    .description(h.path("description").asText(""))
                    .holidayType(h.path("type").get(0).asText(""))
                    .isOptional(name.toLowerCase().contains("varalakshmi"))
                    .source("calendarific")
                    .country("IN")
                    .build();

            repo.save(entity);
        }
    }

    public List<Holiday> getByYear(int year) {
        return repo.findByYearOrderByDateAsc(year);
    }
}
