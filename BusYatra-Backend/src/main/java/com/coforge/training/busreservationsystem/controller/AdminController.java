package com.coforge.training.busreservationsystem.controller;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.coforge.training.busreservationsystem.model.Booking;
import com.coforge.training.busreservationsystem.model.User;
import com.coforge.training.busreservationsystem.repository.BookingRepository;
import com.coforge.training.busreservationsystem.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Calculate Total Profits 
    @GetMapping("/profits")
    public ResponseEntity<Double> getTotalProfits() {
        List<Booking> allBookings = bookingRepository.findAll();
        double totalProfit = allBookings.stream()
                .filter(b -> "BOOKED".equals(b.getStatus()))
                .mapToDouble(Booking::getAmountPaid)
                .sum();
        return ResponseEntity.ok(totalProfit);
    }

    // 2. Customers with ZERO reservations 
    @GetMapping("/inactive-users")
    public ResponseEntity<List<User>> getInactiveUsers() {
        List<User> allUsers = userRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAll();
        
        // Find IDs of users who have bookings
        Set<Long> activeUserIds = allBookings.stream()
                .map(b -> b.getUser().getId())
                .collect(Collectors.toSet());
                
        // Filter users who are NOT in the active list
        List<User> inactiveUsers = allUsers.stream()
                .filter(u -> !activeUserIds.contains(u.getId()) && !"admin@test.com".equals(u.getEmail()))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(inactiveUsers);
    }
    
 // 3. Most Frequent Route
    @GetMapping("/frequent-route")
    public ResponseEntity<Map<String, String>> getMostFrequentRoute() {
        List<Booking> allBookings = bookingRepository.findAll();

        if (allBookings.isEmpty()) {
            return ResponseEntity.ok(Collections.singletonMap("route", "No bookings yet"));
        }

        // Group by "Source ➔ Destination" and count the tickets
        Map<String, Long> routeCounts = allBookings.stream()
                .filter(b -> b.getBus() != null && "BOOKED".equals(b.getStatus())) // Only count active bookings
                .collect(Collectors.groupingBy(
                        b -> b.getBus().getSource() + " ➔ " + b.getBus().getDestination(),
                        Collectors.counting()
                ));

        // Find the route with the highest count
        String frequentRoute = routeCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("No active routes");

        // Return as a JSON object: {"route": "Kanpur ➔ Delhi"}
        return ResponseEntity.ok(Collections.singletonMap("route", frequentRoute));
    }
    
 // 4. Most Preferred Bus Type (e.g., AC, Sleeper, Seater)
    @GetMapping("/preferred-bus")
    public ResponseEntity<Map<String, String>> getPreferredBus() {
        List<Booking> bookings = bookingRepository.findAll();
        // Logic to find the bus name/type most frequently booked [cite: 71]
        String preferred = bookings.stream()
                .collect(Collectors.groupingBy(b -> b.getBus().getBusName(), Collectors.counting()))
                .entrySet().stream().max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse("N/A");
        return ResponseEntity.ok(Collections.singletonMap("type", preferred));
    }
    
   
}