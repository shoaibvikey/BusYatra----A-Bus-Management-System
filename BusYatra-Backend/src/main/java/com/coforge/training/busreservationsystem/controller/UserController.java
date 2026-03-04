package com.coforge.training.busreservationsystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.coforge.training.busreservationsystem.model.User;
import com.coforge.training.busreservationsystem.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200") // This allows your Angular app to talk to Spring Boot
public class UserController {

    @Autowired
    private UserService userService;

    // Endpoint for Customer Registration [cite: 17]
    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> loginCustomer(@RequestBody User loginDetails) {
        try {
            // We only need email and password from the loginDetails object
            User loggedInUser = userService.loginUser(loginDetails.getEmail(), loginDetails.getPassword());
            return new ResponseEntity<>(loggedInUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }
    
    @PostMapping("/{userId}/wallet/add")
    public ResponseEntity<?> addMoneyToWallet(@PathVariable Long userId, @RequestParam Double amount) {
        try {
            User updatedUser = userService.addMoneyToWallet(userId, amount);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
    
    @PutMapping("/{userId}/profile")
    public ResponseEntity<User> updateProfile(@PathVariable Long userId, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUserProfile(userId, user));
    }

    @PostMapping("/{userId}/change-password")
    public ResponseEntity<String> changePassword(@PathVariable Long userId, 
                                               @RequestParam String currentPwd, 
                                               @RequestParam String newPwd) {
        userService.changePassword(userId, currentPwd, newPwd);
        return ResponseEntity.ok("Password updated successfully!");
    }
}
