package com.example.job_reg_backend.service;

import com.example.job_reg_backend.model.HRJobType;
import com.example.job_reg_backend.repository.HRJobTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
//import java.util.Optional;

@Service
public class HRJobTypeService {

    private final HRJobTypeRepository repository;

    @Autowired
    private HRJobTypeRepository hrJobTypeRepository;

    public HRJobTypeService(HRJobTypeRepository repository) {
        this.repository = repository;
    }
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }
    // Fetch all job types
    public List<HRJobType> findAll() {
        return repository.findAll();
    }

    // Fetch job type by ID
    public HRJobType findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Job Type not found with ID: " + id));
    }

    // Fetch job type by job title
    public HRJobType findByJobTitle(String jobTitle) {
        return repository.findByJobTitle_JobTitle(jobTitle)
                .orElseThrow(() -> new RuntimeException("Job Type not found with title: " + jobTitle));
    }
    public List<HRJobType> findByJobTitleIds(List<Long> jobTitleIds) {
    return repository.findByJobTitleIds(jobTitleIds);
}

    // Create or Update job type
    public HRJobType save(HRJobType jobType) {
        return repository.save(jobType);
    }
    // Fetch job type by job family and job title
public HRJobType findByJobFamilyAndJobTitle(Long jobFamilyId, Long jobTitleId) {
    List<HRJobType> jtList = hrJobTypeRepository.findByJobFamilyAndJobTitle_Id(jobFamilyId, jobTitleId);
    if (!jtList.isEmpty()) return jtList.get(0);
    List<HRJobType> fallbackList = hrJobTypeRepository.findByJobTitle_IdAndJobFamilyIsNull(jobTitleId);
    if (!fallbackList.isEmpty()) return fallbackList.get(0);
    // Fallback: find any HRJobType with this jobTitleId
    List<HRJobType> anyList = hrJobTypeRepository.findByJobTitle_Id(jobTitleId);
    if (!anyList.isEmpty()) return anyList.get(0);
    return null;
}

    public List<HRJobType> findByJobFamily(Long jobFamilyId) {
    return hrJobTypeRepository.findByJobFamily(jobFamilyId);
}
    // Delete job type by ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Job Type not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    // Fetch the last job code for a given Job Title ID
    public String getLastJobCode(Long jobTitleId) {
        return repository.findLastJobCodeByJobTitleId(jobTitleId);
    }

    // Generate a new job code
    public String generateJobCode(String lastCode, Long jobTitleId) {
        String prefix = "INSA/" + String.format("%03d", jobTitleId) + "/";
        int nextNumber = 1;

        if (lastCode != null && lastCode.startsWith(prefix)) {
            String[] parts = lastCode.split("/");
            nextNumber = Integer.parseInt(parts[2]) + 1;
        }

        return prefix + String.format("%03d", nextNumber);
    }
}