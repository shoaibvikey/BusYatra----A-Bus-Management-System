package com.coforge.training.busreservationsystem.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coforge.training.busreservationsystem.model.User;
import com.coforge.training.busreservationsystem.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {
        // Business Logic: Check if user already exists
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email is already registered!");
        }
        // Save the user to the database
        return userRepository.save(user);
    }

    // Add this to your UserService class
    public User loginUser(String email, String password) {
        User user = userRepository.findByEmailAndPassword(email, password);
        if (user == null) {
            throw new RuntimeException("Invalid email or password!");
        }
        return user;
    }

    public User addMoneyToWallet(Long userId, Double amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setWalletBalance(user.getWalletBalance() + amount);
        return userRepository.save(user);
    }

    // To update address, gender, and contact info
    public User updateUserProfile(Long userId, User updatedDetails) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setAddress(updatedDetails.getAddress());
        user.setGender(updatedDetails.getGender());
        user.setDob(updatedDetails.getDob());
        user.setContactNo(updatedDetails.getContactNo());
        return userRepository.save(user);
    }

    // To verify current password before changing [cite: 199, 200, 206]
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getPassword().equals(currentPassword)) {
            throw new RuntimeException("Current password does not match!");
        }
        user.setPassword(newPassword);
        userRepository.save(user);
    }
}