package com.coforge.training.busreservationsystem.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import com.coforge.training.busreservationsystem.model.Bus;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // Uses your real MySQL DB for the test
public class BusRepositoryTest {

    @Autowired
    private BusRepository busRepository;

    @Test
    void testFindBySourceAndDestination() {
        // 1. Create and save a bus
        Bus bus = new Bus();
        bus.setBusName("Test Express");
        bus.setSource("Delhi");
        bus.setDestination("Agra");
        bus.setDepartureTime(LocalTime.of(10, 0));
        bus.setArrivalTime(LocalTime.of(14, 0));
        bus.setTotalSeats(24);
        bus.setFare(500.0);
        busRepository.save(bus);

        // 2. Test the search query
        List<Bus> foundBuses = busRepository.findBySourceAndDestination("Delhi", "Agra");
        
        // 3. Verify
        assertEquals(1, foundBuses.size());
        assertEquals("Test Express", foundBuses.get(0).getBusName());
        
        // Cleanup after test
        busRepository.delete(bus);
    }
}