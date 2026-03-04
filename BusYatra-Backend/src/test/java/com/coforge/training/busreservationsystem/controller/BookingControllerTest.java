package com.coforge.training.busreservationsystem.controller;

//import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.coforge.training.busreservationsystem.service.BookingService;

@WebMvcTest(BookingController.class)
public class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookingService bookingService;

    @Test
    void testCancelUnauthorizedBooking_API() throws Exception {
        // Customer cancels reservation by entering email and transaction ID [cite: 55]
        // Expecting an HTTP 200 OK status from the API
        mockMvc.perform(post("/api/bookings/cancel/unauthorized")
                .param("transactionId", "TXN-12345")
                .param("email", "guest@domain.com"))
                .andExpect(status().isOk());
    }
}