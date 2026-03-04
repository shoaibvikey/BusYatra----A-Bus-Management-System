package com.coforge.training.busreservationsystem.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

// Note: If your User class is in the 'model' package, press Cmd+Shift+O to import it correctly!
import com.coforge.training.busreservationsystem.model.User; 

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindByEmail() {
        // 1. Create and save a user
        User user = new User();
        user.setFirstName("Jane");
        user.setLastName("Doe");
        user.setEmail("jane.doe@example.com");
        user.setPassword("securepass");
        user.setContactNo("9876543210");
        userRepository.save(user);

        // 2. Test the custom findByEmail method
        User foundUser = userRepository.findByEmail("jane.doe@example.com");

        // 3. Verify
        assertNotNull(foundUser);
        assertEquals("Jane", foundUser.getFirstName());

        // Cleanup
        userRepository.delete(user);
    }
}