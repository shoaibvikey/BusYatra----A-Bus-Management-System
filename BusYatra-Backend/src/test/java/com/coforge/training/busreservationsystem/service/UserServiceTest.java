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

import com.coforge.training.busreservationsystem.model.User;
import com.coforge.training.busreservationsystem.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@domain.com");
        user.setWalletBalance(500.0);
    }

    @Test
    void testRegisterUser_Success() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(null);
        when(userRepository.save(user)).thenReturn(user);

        User savedUser = userService.registerUser(user);

        assertNotNull(savedUser);
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testRegisterUser_DuplicateEmail() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(user); // Simulates email already exists

        Exception exception = assertThrows(RuntimeException.class, () -> {
            userService.registerUser(user);
        });

        assertEquals("Email is already registered!", exception.getMessage());
    }

    @Test
    void testAddMoneyToWallet() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        User updatedUser = userService.addMoneyToWallet(1L, 200.0);

        assertEquals(700.0, updatedUser.getWalletBalance());
    }
}