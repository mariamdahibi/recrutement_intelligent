package com.example.projettut.controller;

import com.example.projettut.entity.Application;
import com.example.projettut.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin("*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    // POST → postuler
    @PostMapping
    public Application apply(@RequestBody Application application) {
        return applicationService.apply(application);
    }

    // GET → voir toutes les candidatures
    @GetMapping
    public List<Application> getAll() {
        return applicationService.getAll();
    }

    // DELETE → supprimer candidature
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        applicationService.delete(id);
    }
}