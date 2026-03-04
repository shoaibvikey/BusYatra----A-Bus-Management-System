import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { FeedbackService } from '../../services/feedback.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-bookings.component.html'
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  displayedBookings: any[] = []; 

  statusFilter: string = 'ALL';
  sortOrder: string = 'LATEST';

  private bookingService = inject(BookingService);
  private feedbackService = inject(FeedbackService);

  // Modal Variables
  selectedBookingForFeedback: any = null;
  feedbackData = { rating: 5, message: '' };
  selectedTicket: any = null; 

  // Reschedule Variables
  selectedBookingForReschedule: any = null;
  newJourneyDate: string = '';
  minRescheduleDate: string = '';
  maxRescheduleDate: string = '';

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
      if (user.id) {
        this.loadBookings(user.id);
      }
    }
    this.calculateRescheduleDates(); // Initialize the 1-year window
  }

  // Calculates the 1-Year Rescheduling Window
  calculateRescheduleDates() {
    const today = new Date();
    
    // Minimum date: Tomorrow (You usually can't reschedule for the exact same day)
    const min = new Date(today);
    min.setDate(min.getDate() + 1);
    this.minRescheduleDate = min.toISOString().split('T')[0];

    // Maximum date: Exactly 1 year from today
    const max = new Date(today);
    max.setFullYear(max.getFullYear() + 1);
    this.maxRescheduleDate = max.toISOString().split('T')[0];
  }

  loadBookings(userId: number) {
    this.bookingService.getUserBookings(userId).subscribe({
      next: (data: any) => {
        this.bookings = data;
        this.applyFilters(); 
      },
      error: (err: any) => console.error("Error loading tickets", err)
    });
  }

  applyFilters() {
    let filtered = this.bookings.filter(b => {
      if (this.statusFilter === 'ALL') return true;
      return b.status === this.statusFilter;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.journeyDate).getTime();
      const dateB = new Date(b.journeyDate).getTime();
      
      if (this.sortOrder === 'LATEST') {
        return dateB - dateA; 
      } else {
        return dateA - dateB; 
      }
    });

    this.displayedBookings = filtered;
  }

  onCancel(bookingId: number) {
    const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    Swal.fire({
      title: 'Cancel Ticket?',
      text: "Your refund will be added to your wallet instantly.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.cancelBooking(bookingId, user.id).subscribe({
          next: (msg: any) => { 
            Swal.fire('Cancelled!', 'Your ticket has been cancelled successfully.', 'success');
            this.loadBookings(user.id);
          },
          error: (err: any) => Swal.fire('Error', 'Cancellation failed!', 'error')
        });
      }
    });
  }

  openTicketModal(booking: any) {
    this.selectedTicket = booking;
  }

  printTicketAction() {
    window.print();
  }

  openFeedbackModal(booking: any) {
    this.selectedBookingForFeedback = booking;
    this.feedbackData = { rating: 5, message: '' }; 
  }

  submitFeedback() {
    if (!this.feedbackData.message.trim()) {
      setTimeout(() => Swal.fire('Wait!', 'Please write a message before submitting.', 'warning'), 300);
      return;
    }

    const payload = {
      name: this.selectedBookingForFeedback.user.firstName + ' ' + this.selectedBookingForFeedback.user.lastName,
      email: this.selectedBookingForFeedback.user.email,
      subject: 'Feedback for Booking #' + this.selectedBookingForFeedback.id + ' (' + this.selectedBookingForFeedback.bus.busName + ')',
      message: this.feedbackData.message,
      rating: this.feedbackData.rating
    };

    this.feedbackService.submitFeedback(payload).subscribe({
      next: (res) => {
        this.selectedBookingForFeedback.feedbackSubmitted = true;
        this.bookingService.updateBooking(this.selectedBookingForFeedback.id, this.selectedBookingForFeedback).subscribe();

        setTimeout(() => {
          Swal.fire({
            title: 'Thank You!',
            text: 'Your feedback has been submitted to the admin team.',
            icon: 'success',
            timer: 2500,
            showConfirmButton: false
          });
        }, 300);
      },
      error: (err) => {
        setTimeout(() => Swal.fire('Error', 'Could not submit feedback at this time.', 'error'), 300);
        console.error(err);
      }
    });
  }

  // --- Reschedule Methods ---
  openRescheduleModal(booking: any) {
    this.selectedBookingForReschedule = booking;
    this.newJourneyDate = ''; // Reset the date input
  }

  submitReschedule() {
    if (!this.newJourneyDate) {
      setTimeout(() => Swal.fire('Wait!', 'Please select a new journey date.', 'warning'), 300);
      return;
    }

    // Change the journey date in the object
    this.selectedBookingForReschedule.journeyDate = this.newJourneyDate;

    // Send the updated booking to the database
    this.bookingService.updateBooking(this.selectedBookingForReschedule.id, this.selectedBookingForReschedule).subscribe({
      next: (res) => {
        setTimeout(() => {
          Swal.fire({
            title: 'Rescheduled!',
            text: `Your journey has been successfully rescheduled to ${this.newJourneyDate}.`,
            icon: 'success',
            timer: 2500,
            showConfirmButton: false
          });
        }, 300);
        
        // Refresh the filter list to reflect the new date order
        this.applyFilters(); 
      },
      error: (err) => {
        setTimeout(() => Swal.fire('Error', 'Could not reschedule ticket at this time.', 'error'), 300);
      }
    });
  }
}