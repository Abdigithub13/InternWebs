package com.example.employee_management.controller;

import com.example.employee_management.entity.HRJob_Type;
import com.example.employee_management.service.HRJob_TypeService;
import com.example.employee_management.service.HrLuJobFamilyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api/hr-job-types")
@CrossOrigin(origins = "http://localhost:3000")
public class HRJob_TypeController {

    private final HRJob_TypeService service;
    private final HrLuJobFamilyService jobFamilyService;

    // Constructor for dependency injection
    public HRJob_TypeController(HRJob_TypeService service, HrLuJobFamilyService jobFamilyService) {
        this.service = service;
        this.jobFamilyService = jobFamilyService;
    }

    // Fetch all job types
    @GetMapping
    public ResponseEntity<List<HRJob_Type>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Fetch job type by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/by-job-family-and-title")
    public ResponseEntity<?> getByJobFamilyAndTitle(
            @RequestParam Long jobFamilyId,
            @RequestParam Long jobTitleId) {
        try {
            HRJob_Type jt = service.findByJobFamilyAndJobTitle(jobFamilyId, jobTitleId);
            if (jt == null)
                return ResponseEntity.status(404).body("No job type found for this job title.");
            Map<String, Object> map = new HashMap<>();
            map.put("id", jt.getId());
            map.put("jobTitle", jt.getJobTitle().getJobTitle());
            map.put("jobCode", jt.getJobCode());
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/by-job-family/{jobFamilyId}")
    public ResponseEntity<List<Map<String, Object>>> getJobTypesByJobFamily(@PathVariable Long jobFamilyId) {
        List<HRJob_Type> jobTypes = service.findByJobFamily(jobFamilyId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (HRJob_Type jt : jobTypes) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", jt.getId());
            map.put("jobTitle", jt.getJobTitle().getJobTitle());
            map.put("jobTitleId", jt.getJobTitle().getId());
            map.put("jobCode", jt.getJobCode());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // Update job family
    @PutMapping("/update-job-family")
    public ResponseEntity<?> updateJobFamily(@RequestBody List<Map<String, Long>> jobTypeUpdates) {
        try {
            for (Map<String, Long> update : jobTypeUpdates) {
                Long jobTitleId = update.get("jobTitleId");
                Long jobFamilyId = update.get("jobFamilyId");

                // Find all HRJobType rows for this job title
                List<HRJob_Type> jobTypes = service.findByJobTitleIds(List.of(jobTitleId));
                if (jobTypes.isEmpty()) {
                    return ResponseEntity.status(404).body("Job Type not found for Job Title ID: " + jobTitleId);
                }
                for (HRJob_Type jobType : jobTypes) {
                    jobType.setJobFamily(jobFamilyId);
                    service.save(jobType);
                }
            }

            return ResponseEntity.ok("Job Family updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating Job Family: " + e.getMessage());
        }
    }

    // Create a new job type or save multiple job types
    @PostMapping("/save-job-types")
    public ResponseEntity<?> saveJobTypes(@RequestBody List<HRJob_Type> jobTypes) {
        try {
            List<Long> savedJobTypeIds = new ArrayList<>();
            for (HRJob_Type jobType : jobTypes) {
                String lastCode = service.getLastJobCode(jobType.getJobTitle().getId());
                String newCode = service.generateJobCode(lastCode, jobType.getJobTitle().getId());
                jobType.setJobCode(newCode);

                HRJob_Type savedJobType = service.save(jobType);
                savedJobTypeIds.add(savedJobType.getId());
            }
            return ResponseEntity.ok(savedJobTypeIds);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving job types: " + e.getMessage());
        }
    }

    // Fetch jobFamily, jobCode, and jobGrade by job title ID
    @GetMapping("/details-by-job-title-id")
    public ResponseEntity<?> getDetailsByJobTitleIds(@RequestParam Long jobTitleId) {
        try {
            List<HRJob_Type> jobTypes = service.findByJobTitleIds(List.of(jobTitleId));
            if (jobTypes.isEmpty()) {
                return ResponseEntity.status(404).body("No job type found for the given job title ID.");
            }
            HRJob_Type jobType = jobTypes.stream()
                    .filter(jt -> jt.getJobTitle().getId().equals(jobTitleId))
                    .findFirst()
                    .orElse(jobTypes.get(0));
            Long jobFamilyId = jobType.getJobFamily();
            String jobFamilyName = "N/A";
            if (jobFamilyId != null) {
                jobFamilyName = jobFamilyService.getJobFamilyById(jobFamilyId).getFamilyName();
            }

            // Prepare the response with the correct jobTypeId
            Map<String, Object> jobDetails = new HashMap<>();
            jobDetails.put("jobTypeId", jobType.getId());
            jobDetails.put("jobCode", jobType.getJobCode());
            jobDetails.put("jobTitle", jobType.getJobTitle().getJobTitle());
            jobDetails.put("jobFamily", jobFamilyName);
            jobDetails.put("jobGrade", jobType.getJobGrade() != null ? jobType.getJobGrade().getGrade() : "N/A");

            return ResponseEntity.ok(jobDetails);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching job details: " + e.getMessage());
        }
    }

    // Update an existing job type
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody HRJob_Type jobType) {
        try {
            HRJob_Type existingJobType = service.findById(id);
            existingJobType.setJobCode(jobType.getJobCode());
            existingJobType.setJobStatus(jobType.getJobStatus());
            existingJobType.setRemark(jobType.getRemark());
            existingJobType.setJobTitle(jobType.getJobTitle());
            existingJobType.setJobGrade(jobType.getJobGrade());
            existingJobType.setJobFamily(jobType.getJobFamily());
            return ResponseEntity.ok(service.save(existingJobType));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating job type: " + e.getMessage());
        }
    }

    // Delete a job type by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteById(id);
            return ResponseEntity.ok("Job type deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}