package com.coforge.training.busreservationsystem.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.coforge.training.busreservationsystem.model.User;
import com.coforge.training.busreservationsystem.service.UserService;
//import com.fasterxml.jackson.databind.ObjectMapper;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest(UserController.class) // This tells Spring to only load the web layer for testing
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc; // Simulates HTTP requests

    @MockitoBean
    private UserService userService; // Mocks the service layer

    @Autowired
    private ObjectMapper objectMapper; // Converts Java objects to JSON

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john@example.com");
        user.setPassword("password123");
        user.setContactNo("1234567890");
    }

    @Test
    void testRegisterCustomer_Success() throws Exception {
        // When the controller calls the service, return our mock user
        when(userService.registerUser(any(User.class))).thenReturn(user);

        // Simulate a POST request from Angular to our API
        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user))) // Convert user object to JSON string
                .andExpect(status().isCreated()) // Expect HTTP 201 Created
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }
}