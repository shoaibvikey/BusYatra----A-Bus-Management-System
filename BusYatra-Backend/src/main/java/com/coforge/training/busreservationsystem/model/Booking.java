package com.coforge.training.busreservationsystem.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String transactionId; // Required for unauthorized cancellation 

    // Link to the Bus being booked
    @ManyToOne
    @JoinColumn(name = "bus_id")
    private Bus bus;

    // Link to an authorized User (can be null if it's an unauthorized guest) [cite: 40, 45]
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    // For unauthorized customers [cite: 43]
    private String guestName;
    public String getGuestName() {
		return guestName;
	}
	public void setGuestName(String guestName) {
		this.guestName = guestName;
	}

	private String guestEmail;
    private String guestPhone;

    @NotNull(message = "Journey date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate journeyDate;

    @NotBlank(message = "Seat numbers are required")
    private String seatNumbers; // e.g., "12,13" 

    private Double amountPaid;
    
    private String status; // e.g., "BOOKED", "CANCELLED" [cite: 61, 175]
    
    private boolean feedbackSubmitted = false;
    
    private Boolean withDriver;
    private Double securityDeposit;
    
   
  
    

    public Boolean getWithDriver() {
		return withDriver;
	}
	public void setWithDriver(Boolean withDriver) {
		this.withDriver = withDriver;
	}
	public Double getSecurityDeposit() {
		return securityDeposit;
	}
	public void setSecurityDeposit(Double securityDeposit) {
		this.securityDeposit = securityDeposit;
	}
	// --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Bus getBus() { return bus; }
    public void setBus(Bus bus) { this.bus = bus; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }

    public LocalDate getJourneyDate() { return journeyDate; }
    public void setJourneyDate(LocalDate journeyDate) { this.journeyDate = journeyDate; }

    public String getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(String seatNumbers) { this.seatNumbers = seatNumbers; }

    public Double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
 // Add these Getters and Setters
    public boolean isFeedbackSubmitted() {
        return feedbackSubmitted;
    }

    public void setFeedbackSubmitted(boolean feedbackSubmitted) {
        this.feedbackSubmitted = feedbackSubmitted;
    }
}