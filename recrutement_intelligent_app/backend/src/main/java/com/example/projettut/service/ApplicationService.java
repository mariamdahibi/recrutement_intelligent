package com.example.projettut.service;

import com.example.projettut.entity.Application;
import com.example.projettut.entity.Job;
import com.example.projettut.entity.User;
import com.example.projettut.repository.ApplicationRepository;
import com.example.projettut.repository.JobRepository;
import com.example.projettut.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    // POST (apply)
    public Application apply(Application application) {

        Long userId = application.getUser().getId();
        Long jobId = application.getJob().getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        application.setUser(user);
        application.setJob(job);
        application.setStatus("PENDING");

        return applicationRepository.save(application);
    }

    // GET all
    public List<Application> getAll() {
        return applicationRepository.findAll();
    }

    // DELETE
    public void delete(Long id) {
        applicationRepository.deleteById(id);
    }
}