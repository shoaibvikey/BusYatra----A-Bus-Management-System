package com.coforge.training.busreservationsystem.repository; // Adjust package name if needed

import com.coforge.training.busreservationsystem.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}