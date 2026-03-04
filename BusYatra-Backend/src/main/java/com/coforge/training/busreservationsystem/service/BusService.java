package com.coforge.training.busreservationsystem.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coforge.training.busreservationsystem.model.Bus;
import com.coforge.training.busreservationsystem.repository.BusRepository;

@Service
public class BusService {

    @Autowired
    private BusRepository busRepository;

    // --- ADMIN MODULES ---

    // 1. Add a new bus
    public Bus addBus(Bus bus) {
        return busRepository.save(bus);
    }

    // 2. View all buses
    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    // 3. Remove a bus
    public void deleteBus(Long id) {
        // Business logic: check if the bus exists before deleting
        if(busRepository.existsById(id)) {
            busRepository.deleteById(id);
        } else {
            throw new RuntimeException("Bus not found with id: " + id);
        }
    }

    // --- CUSTOMER MODULES ---

    // 4. Search buses based on Source and Destination
    public List<Bus> searchBuses(String source, String destination) {
        return busRepository.findBySourceAndDestination(source, destination);
    }
    
    public Bus updateBus(Long id, Bus busDetails) {
        Bus bus = busRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bus not found"));
        
        bus.setBusName(busDetails.getBusName());
        bus.setSource(busDetails.getSource());
        bus.setDestination(busDetails.getDestination());
        bus.setDepartureTime(busDetails.getDepartureTime());
        bus.setArrivalTime(busDetails.getArrivalTime());
        bus.setFare(busDetails.getFare());
        bus.setTotalSeats(busDetails.getTotalSeats());
        bus.setDriverName(busDetails.getDriverName());
        bus.setDriverContact(busDetails.getDriverContact());
        
        return busRepository.save(bus);
    }
}