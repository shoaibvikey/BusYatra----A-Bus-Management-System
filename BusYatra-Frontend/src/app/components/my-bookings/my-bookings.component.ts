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

  // --- NEW LOADING TRACKERS ---
  isLoadingBookings: boolean = true;
  isCancellingId: number | null = null; // Tracks WHICH button is spinning
  isRescheduling: boolean = false;
  isSubmittingFeedback: boolean = false;

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
      if (user.id) {
        this.loadBookings(user.id);
      } else {
        this.isLoadingBookings = false;
      }
    }
    this.calculateRescheduleDates(); 
  }

  calculateRescheduleDates() {
    const today = new Date();
    const min = new Date(today);
    min.setDate(min.getDate() + 1);
    this.minRescheduleDate = min.toISOString().split('T')[0];

    const max = new Date(today);
    max.setFullYear(max.getFullYear() + 1);
    this.maxRescheduleDate = max.toISOString().split('T')[0];
  }

  loadBookings(userId: number) {
    this.isLoadingBookings = true;
    this.bookingService.getUserBookings(userId).subscribe({
      next: (data: any) => {
        this.bookings = data;
        this.applyFilters(); 
        this.isLoadingBookings = false;
      },
      error: (err: any) => {
        console.error("Error loading tickets", err);
        this.isLoadingBookings = false;
      }
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
        // 1. Turn spinner ON for this specific button
        this.isCancellingId = bookingId;

        this.bookingService.cancelBooking(bookingId, user.id).subscribe({
          next: (msg: any) => { 
            this.isCancellingId = null; // Turn OFF
            Swal.fire('Cancelled!', 'Your ticket has been cancelled successfully.', 'success');
            this.loadBookings(user.id);
          },
          error: (err: any) => {
            this.isCancellingId = null; // Turn OFF
            Swal.fire('Error', 'Cancellation failed!', 'error');
          }
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
      Swal.fire('Wait!', 'Please write a message before submitting.', 'warning');
      return;
    }

    // 1. Turn spinner ON
    this.isSubmittingFeedback = true;

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

        // 2. Turn spinner OFF and close modal
        this.isSubmittingFeedback = false;
        this.closeModal('feedbackModal');

        Swal.fire({
          title: 'Thank You!',
          text: 'Your feedback has been submitted.',
          icon: 'success',
          timer: 2500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.isSubmittingFeedback = false;
        Swal.fire('Error', 'Could not submit feedback at this time.', 'error');
        console.error(err);
      }
    });
  }

  openRescheduleModal(booking: any) {
    this.selectedBookingForReschedule = booking;
    this.newJourneyDate = ''; 
  }

  submitReschedule() {
    if (!this.newJourneyDate) {
      Swal.fire('Wait!', 'Please select a new journey date.', 'warning');
      return;
    }

    // 1. Turn spinner ON
    this.isRescheduling = true;

    this.selectedBookingForReschedule.journeyDate = this.newJourneyDate;

    this.bookingService.updateBooking(this.selectedBookingForReschedule.id, this.selectedBookingForReschedule).subscribe({
      next: (res) => {
        // 2. Turn spinner OFF and close modal
        this.isRescheduling = false;
        this.closeModal('rescheduleModal');

        Swal.fire({
          title: 'Rescheduled!',
          text: `Your journey has been successfully rescheduled to ${this.newJourneyDate}.`,
          icon: 'success',
          timer: 2500,
          showConfirmButton: false
        });
        
        this.applyFilters(); 
      },
      error: (err) => {
        this.isRescheduling = false;
        Swal.fire('Error', 'Could not reschedule ticket at this time.', 'error');
      }
    });
  }

  // Helper method to close Bootstrap modals safely
  private closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const closeButton = modalElement.querySelector('.btn-close') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }
}