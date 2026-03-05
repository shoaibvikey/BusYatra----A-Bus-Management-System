package com.coforge.training.busreservationsystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.coforge.training.busreservationsystem.model.Booking;
import com.coforge.training.busreservationsystem.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // API to create a new reservation 
    @PostMapping("/book")
    public ResponseEntity<Booking> bookTicket(@RequestBody Booking booking) {
        Booking savedBooking = bookingService.createBooking(booking);
        return new ResponseEntity<>(savedBooking, HttpStatus.CREATED);
    }

    // API to fetch guest booking details
    @GetMapping("/guest")
    public ResponseEntity<?> getGuestBooking(@RequestParam String transactionId, @RequestParam String email) {
        try {
            return ResponseEntity.ok(bookingService.getGuestBooking(transactionId, email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API to reschedule a guest booking
    @PostMapping("/guest/reschedule")
    public ResponseEntity<?> rescheduleGuestBooking(
            @RequestParam String transactionId, 
            @RequestParam String email, 
            @RequestParam String newDate) {
        try {
            java.time.LocalDate date = java.time.LocalDate.parse(newDate);
            return ResponseEntity.ok(bookingService.rescheduleGuestBooking(transactionId, email, date));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API to cancel an unauthorized reservation (Guest Checkout)
    @PostMapping("/cancel/unauthorized")
    public ResponseEntity<?> cancelGuestBooking(
            @RequestParam String transactionId, 
            @RequestParam String email) {
        try {
            Booking cancelledBooking = bookingService.cancelUnauthorizedBooking(transactionId, email);
            return ResponseEntity.ok(cancelledBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // API to cancel an authorized reservation (Logged in User)
    @PostMapping("/cancel/authorized")
    public ResponseEntity<String> cancelAuthorizedBooking(
            @RequestParam Long bookingId, 
            @RequestParam Long userId) {
        try {
            bookingService.cancelAuthorizedBooking(bookingId, userId);
            return new ResponseEntity<>("Reservation cancelled and amount refunded to wallet instantly.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Long userId) {
        List<Booking> bookings = bookingService.getBookingsByUserId(userId);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }
    
    @GetMapping("/occupied-seats")
    public ResponseEntity<List<String>> getOccupiedSeats(
            @RequestParam Long busId, 
            @RequestParam String date) {
        java.time.LocalDate journeyDate = java.time.LocalDate.parse(date);
        List<Booking> bookings = bookingService.getBookingsByBusAndDate(busId, journeyDate);
        List<String> takenSeats = bookings.stream()
                .map(Booking::getSeatNumbers)
                .flatMap(s -> java.util.Arrays.stream(s.split(",")))
                .toList();
        return new ResponseEntity<>(takenSeats, HttpStatus.OK);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Booking details) {
        return ResponseEntity.ok(bookingService.updateBooking(id, details));
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}