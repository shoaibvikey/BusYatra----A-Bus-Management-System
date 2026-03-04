package com.coforge.training.busreservationsystem.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.coforge.training.busreservationsystem.model.Booking;
import com.coforge.training.busreservationsystem.model.User;
import com.coforge.training.busreservationsystem.repository.BookingRepository;
import com.coforge.training.busreservationsystem.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    private Booking booking;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setWalletBalance(100.0); // Initial wallet balance

        booking = new Booking();
        booking.setId(100L);
        booking.setUser(user);
        booking.setAmountPaid(900.0); // Ticket fare
        booking.setStatus("BOOKED");
    }

    @Test
    void testCancelAuthorizedBooking_Success() {
        // Setup mock behavior
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(userRepository.save(user)).thenReturn(user);
        when(bookingRepository.save(booking)).thenReturn(booking);

        // Execute the service method
        Booking cancelledBooking = bookingService.cancelAuthorizedBooking(100L, 1L);

        // Verify the ticket was cancelled
        assertEquals("CANCELLED", cancelledBooking.getStatus());
        
        // Verify the wallet refund logic: 100 (initial) + 900 (refund) = 1000.0
        assertEquals(1000.0, user.getWalletBalance());
        
        verify(userRepository, times(1)).save(user);
        verify(bookingRepository, times(1)).save(booking);
    }
}