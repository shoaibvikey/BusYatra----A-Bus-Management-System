package com.coforge.training.busreservationsystem.model;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "buses")
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Bus name/Travels name is required")
    private String busName; // e.g., "Divya Travellers"

    @NotBlank(message = "Source city is required")
    private String source;

    @NotBlank(message = "Destination city is required")
    private String destination;

    @JsonFormat
    @NotNull(message = "Departure time is required")
    private LocalTime departureTime;

    @JsonFormat
    @NotNull(message = "Arrival time is required")
    private LocalTime arrivalTime;

    @NotNull(message = "Total seats are required")
    private Integer totalSeats = 24; // Defaulting to 24 seats based on your UI diagram

    @NotNull(message = "Fare amount is required")
    private Double fare;
    
    private String driverName;
    
    private String driverContact;

    // --- Getters and Setters ---

    public String getDriverName() {
		return driverName;
	}
	public void setDriverName(String driverName) {
		this.driverName = driverName;
	}
	public String getDriverContact() {
		return driverContact;
	}
	public void setDriverContact(String driverContact) {
		this.driverContact = driverContact;
	}
	public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBusName() { return busName; }
    public void setBusName(String busName) { this.busName = busName; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public LocalTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalTime departureTime) { this.departureTime = departureTime; }

    public LocalTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalTime arrivalTime) { this.arrivalTime = arrivalTime; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Double getFare() { return fare; }
    public void setFare(Double fare) { this.fare = fare; }
}