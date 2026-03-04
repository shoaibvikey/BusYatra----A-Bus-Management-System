package com.coforge.training.busreservationsystem;

import java.time.LocalTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

// Import your entity and repository (adjust the package names if needed)
import com.coforge.training.busreservationsystem.model.Bus;
import com.coforge.training.busreservationsystem.repository.BusRepository;

@SpringBootApplication
public class BusReservationSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(BusReservationSystemApplication.class, args);
	}
	
	@Bean
    public CommandLineRunner seedDatabase(BusRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                Bus bus1 = new Bus();
                bus1.setBusName("Blueline Express");
                bus1.setSource("Mumbai");
                bus1.setDestination("Pune");
                bus1.setFare(1200.0);
                bus1.setDepartureTime(LocalTime.of(22, 0)); // 10:00 PM
                bus1.setArrivalTime(LocalTime.of(6, 0));    // 06:00 AM
                bus1.setTotalSeats(24);
                repository.save(bus1);

                Bus bus2 = new Bus();
                bus2.setBusName("White Wing Travels");
                bus2.setSource("Delhi");
                bus2.setDestination("Jaipur");
                bus2.setFare(600.0);
                bus2.setDepartureTime(LocalTime.of(8, 0));  // 08:00 AM
                bus2.setArrivalTime(LocalTime.of(14, 0));   // 02:00 PM
                bus2.setTotalSeats(40);
                repository.save(bus2);

                System.out.println("✅ MOCK BUSES INSERTED SUCCESSFULLY!");
            }
        };
    }

}
