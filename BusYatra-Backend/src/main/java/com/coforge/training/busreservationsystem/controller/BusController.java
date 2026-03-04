package com.coforge.training.busreservationsystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.coforge.training.busreservationsystem.model.Bus;
import com.coforge.training.busreservationsystem.service.BusService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestMethod;
@RestController
@RequestMapping("/api/buses")
@CrossOrigin(origins = "http://localhost:4200", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})// Allows your Angular frontend to communicate with this backend
public class BusController {

    @Autowired
    private BusService busService;

    // --- ADMIN ENDPOINTS ---

   // POST: Add a new bus
    @PostMapping("/add")
    public ResponseEntity<Bus> addBus(@Valid @RequestBody Bus bus) {
        Bus savedBus = busService.addBus(bus);
        return new ResponseEntity<>(savedBus, HttpStatus.CREATED);
    }

    // GET: View all buses 
    @GetMapping("/all")
    public ResponseEntity<List<Bus>> getAllBuses() {
        List<Bus> buses = busService.getAllBuses();
        return new ResponseEntity<>(buses, HttpStatus.OK);
    }

   // DELETE: Remove a bus by its ID
    @DeleteMapping("/remove/{id}")
    public ResponseEntity<String> deleteBus(@PathVariable Long id) {
        try {
            busService.deleteBus(id);
            return new ResponseEntity<>("Bus removed successfully", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // --- CUSTOMER ENDPOINTS ---

   // GET: Search for buses by source and destination
    @GetMapping("/search")
    public ResponseEntity<List<Bus>> searchBuses(
            @RequestParam String source, 
            @RequestParam String destination) {
        List<Bus> availableBuses = busService.searchBuses(source, destination);
        return new ResponseEntity<>(availableBuses, HttpStatus.OK);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Bus> updateBus(@PathVariable Long id, @RequestBody Bus busDetails) {
        return ResponseEntity.ok(busService.updateBus(id, busDetails));
    }
    
}
