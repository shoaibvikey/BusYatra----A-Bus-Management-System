package com.coforge.training.busreservationsystem.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.coforge.training.busreservationsystem.model.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // 👉 THIS IS THE NEW LINE YOU NEED! 
    // Required for finding the guest ticket to reschedule it!
    Optional<Booking> findByTransactionId(String transactionId);
    
    // Find all bookings for a specific bus on a specific date to check booked seats 
    List<Booking> findByBusIdAndJourneyDateAndStatus(Long busId, LocalDate journeyDate, String status);

    // Find by transaction ID and email for unauthorized cancellation 
    Optional<Booking> findByTransactionIdAndGuestEmail(String transactionId, String guestEmail);

    // Find all bookings for a registered user's dashboard
    List<Booking> findByUserId(Long userId);
}