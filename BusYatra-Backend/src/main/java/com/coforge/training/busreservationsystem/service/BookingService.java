package com.coforge.training.busreservationsystem.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coforge.training.busreservationsystem.model.Booking;
import com.coforge.training.busreservationsystem.model.User;
import com.coforge.training.busreservationsystem.repository.BookingRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private com.coforge.training.busreservationsystem.repository.UserRepository userRepository;

    // Make a reservation 
    public Booking createBooking(Booking booking) {
        // Generate a unique transaction ID for the E-Ticket
        booking.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setStatus("BOOKED");
        return bookingRepository.save(booking);
    }

    // Get Guest Booking for lookup
    public Booking getGuestBooking(String transactionId, String email) {
        Booking booking = bookingRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Invalid Transaction ID"));
        
        String bookingEmail = booking.getGuestEmail() != null ? booking.getGuestEmail() : 
                             (booking.getUser() != null ? booking.getUser().getEmail() : "");
                             
        if (!bookingEmail.equalsIgnoreCase(email)) {
            throw new RuntimeException("Email does not match our records.");
        }
        return booking;
    }

    // Reschedule Guest Booking
    public Booking rescheduleGuestBooking(String transactionId, String email, java.time.LocalDate newDate) {
        Booking booking = getGuestBooking(transactionId, email);
        booking.setJourneyDate(newDate);
        return bookingRepository.save(booking);
    }

    // Unauthorized customer cancellation
    public Booking cancelUnauthorizedBooking(String transactionId, String email) {
        Booking booking = bookingRepository.findByTransactionIdAndGuestEmail(transactionId, email)
                .orElseThrow(() -> new RuntimeException("Invalid Transaction ID or Email"));
        
        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }
    
    @org.springframework.transaction.annotation.Transactional
    public Booking cancelAuthorizedBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Security check: Ensure the booking actually belongs to this user
        if (booking.getUser() == null || !booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        // 1. Cancel the ticket
        booking.setStatus("CANCELLED");
        
        // 2. Refund the paid amount back to the personal wallet instantly 
        User user = booking.getUser();
        user.setWalletBalance(user.getWalletBalance() + booking.getAmountPaid());
        userRepository.save(user); 

        return bookingRepository.save(booking);
    }
    
    public java.util.List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId);
    }
    
    public List<Booking> getBookingsByBusAndDate(Long busId, java.time.LocalDate date) {
        return bookingRepository.findByBusIdAndJourneyDateAndStatus(busId, date, "BOOKED");
    }
    
    public Booking updateBooking(Long id, Booking details) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setSeatNumbers(details.getSeatNumbers());
        booking.setAmountPaid(details.getAmountPaid());
        booking.setStatus(details.getStatus());
        booking.setFeedbackSubmitted(details.isFeedbackSubmitted());
        booking.setJourneyDate(details.getJourneyDate());
        
        return bookingRepository.save(booking);
    }
    
    // Fetch all bookings for the Admin Dashboard
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}