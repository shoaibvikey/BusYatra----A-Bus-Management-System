package com.coforge.training.busreservationsystem.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.coforge.training.busreservationsystem.model.Bus;
import com.coforge.training.busreservationsystem.service.BusService;

@WebMvcTest(BusController.class)
public class BusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BusService busService;

    @Test
    void testSearchBuses_API() throws Exception {
        Bus bus = new Bus();
        bus.setBusName("Divya Travellers"); // UI requirement [cite: 282]
        bus.setSource("Mumbai");
        bus.setDestination("Pune");

        when(busService.searchBuses("Mumbai", "Pune")).thenReturn(Arrays.asList(bus));

        mockMvc.perform(get("/api/buses/search")
                .param("source", "Mumbai")
                .param("destination", "Pune"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].busName").value("Divya Travellers"));
    }
}