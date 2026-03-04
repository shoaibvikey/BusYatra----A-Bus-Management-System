package com.coforge.training.busreservationsystem.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import com.coforge.training.busreservationsystem.model.Booking;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class BookingRepositoryTest {

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void testFindByTransactionIdAndGuestEmail() {
        // 1. Create a guest booking
        Booking booking = new Booking();
        booking.setTransactionId("TXN-99999");
        booking.setGuestEmail("guest@test.com");
        booking.setJourneyDate(LocalDate.of(2026, 4, 15));
        booking.setSeatNumbers("1,2");
        booking.setStatus("BOOKED");
        bookingRepository.save(booking);

        // 2. Test the custom cancellation search method
        Optional<Booking> foundBooking = bookingRepository.findByTransactionIdAndGuestEmail("TXN-99999", "guest@test.com");

        // 3. Verify
        assertTrue(foundBooking.isPresent());
        assertEquals("TXN-99999", foundBooking.get().getTransactionId());

        // Cleanup
        bookingRepository.delete(booking);
    }
}