package com.coforge.training.busreservationsystem.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.coforge.training.busreservationsystem.model.Bus;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
    
    // Custom query method: Spring automatically writes the SQL to find buses by their route!
    // This will be used for the "Bus Availability Enquiry" module.
    List<Bus> findBySourceAndDestination(String source, String destination);
}