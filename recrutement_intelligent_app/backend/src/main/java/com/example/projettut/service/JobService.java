package com.example.projettut.service;

import com.example.projettut.entity.Job;
import com.example.projettut.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public Job save(Job job) {
        return jobRepository.save(job);
    }

    public List<Job> getAll() {
        return jobRepository.findAll();
    }

    public Job getById(Long id) {
        return jobRepository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        jobRepository.deleteById(id);
    }
    public Job updateJob(Long id, Job newJob) {

        Job existingJob = jobRepository.findById(id).orElse(null);

        if (existingJob != null) {
            existingJob.setTitle(newJob.getTitle());
            existingJob.setDescription(newJob.getDescription());
            existingJob.setLocation(newJob.getLocation());

            return jobRepository.save(existingJob);
        }

        return null;
    }
}