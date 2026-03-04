package com.coforge.training.busreservationsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.coforge.training.busreservationsystem.model.User;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	// Spring Data JPA automatically provides methods to save, delete, and find users!
    // We can add custom methods here later, like finding a user by email for login.
    User findByEmail(String email);
    
 // Add this line inside your UserRepository interface
    User findByEmailAndPassword(String email, String password);
}
