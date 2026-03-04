package com.coforge.training.busreservationsystem.controller;// Adjust package name if needed

import com.coforge.training.busreservationsystem.model.Feedback;
import com.coforge.training.busreservationsystem.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:4200", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    // 1. Customer Endpoint: Submit new feedback
    @PostMapping("/add")
    public ResponseEntity<Feedback> submitFeedback(@RequestBody Feedback feedback) {
        Feedback savedFeedback = feedbackRepository.save(feedback);
        return ResponseEntity.ok(savedFeedback);
    }

    // 2. Admin Endpoint: Get all feedback
    @GetMapping("/all")
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackRepository.findAll());
    }
}