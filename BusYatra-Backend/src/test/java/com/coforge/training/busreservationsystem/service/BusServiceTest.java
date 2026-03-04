package com.coforge.training.busreservationsystem.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.coforge.training.busreservationsystem.model.Bus;
import com.coforge.training.busreservationsystem.repository.BusRepository;

@ExtendWith(MockitoExtension.class)
public class BusServiceTest {

    @Mock
    private BusRepository busRepository;

    @InjectMocks
    private BusService busService;

    private Bus bus;

    @BeforeEach
    void setUp() {
        bus = new Bus();
        bus.setId(1L);
        bus.setBusName("Divya Travellers");
        bus.setSource("Mumbai");
        bus.setDestination("Pune");
        bus.setDepartureTime(LocalTime.of(20, 10)); // 8:10 PM
        bus.setArrivalTime(LocalTime.of(6, 10));    // 6:10 AM
        bus.setTotalSeats(24);
        bus.setFare(900.0);
    }

    @Test
    void testAddBus() {
        // Tell the mock database what to do
        when(busRepository.save(bus)).thenReturn(bus);

        // Test the service
        Bus savedBus = busService.addBus(bus);

        // Verify the results
        assertNotNull(savedBus);
        assertEquals("Divya Travellers", savedBus.getBusName());
        verify(busRepository, times(1)).save(bus);
    }

    @Test
    void testSearchBuses() {
        when(busRepository.findBySourceAndDestination("Mumbai", "Pune")).thenReturn(Arrays.asList(bus));

        List<Bus> result = busService.searchBuses("Mumbai", "Pune");

        assertEquals(1, result.size());
        assertEquals("Mumbai", result.get(0).getSource());
    }
}
