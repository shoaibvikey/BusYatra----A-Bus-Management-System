import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cancel-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cancel-ticket.component.html',
  styleUrl: './cancel-ticket.component.css'
})
export class CancelTicketComponent implements OnInit {
  transactionId: string = '';
  guestEmail: string = '';
  isLoading: boolean = false;
  
  // Steps: 1 = Search, 2 = Choose Action, 3 = Pick New Date
  currentStep: number = 1; 
  bookingDetails: any = null;
  
  newJourneyDate: string = '';
  minDate: string = '';
  maxDate: string = '';

  private bookingService = inject(BookingService);
  private router = inject(Router);

  ngOnInit() {
    // 👉 NEW: Security Check - Block logged-in users from accessing the Guest page!
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('loggedUser');
      if (userStr) {
        Swal.fire({
          title: 'You are logged in!',
          text: 'Registered users can manage and cancel their tickets directly from the Dashboard.',
          icon: 'info',
          confirmButtonColor: '#0d6efd',
          confirmButtonText: 'Go to My Bookings'
        }).then(() => {
          this.router.navigateByUrl('/my-bookings'); 
        });
        return; 
      }
    }

    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    this.maxDate = nextYear.toISOString().split('T')[0];
  }

  findBooking() {
    if (!this.transactionId || !this.guestEmail) {
      Swal.fire('Wait!', 'Please enter both your Transaction ID and Email.', 'warning');
      return;
    }

    this.isLoading = true;
    this.bookingService.getGuestBooking(this.transactionId, this.guestEmail).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if(res.status === 'CANCELLED') {
           Swal.fire('Notice', 'This ticket has already been cancelled.', 'info');
           return;
        }
        this.bookingDetails = res;
        this.currentStep = 2; 
      },
      error: (err: any) => {
        this.isLoading = false;
        Swal.fire('Error', 'Could not find a valid booking with that Transaction ID and Email combination.', 'error');
      }
    });
  }

  showRescheduleOptions() {
    this.currentStep = 3;
  }

  confirmReschedule() {
    if (!this.newJourneyDate) {
      Swal.fire('Wait!', 'Please select a new date.', 'warning');
      return;
    }

    this.isLoading = true;
    this.bookingService.rescheduleGuestBooking(this.transactionId, this.guestEmail, this.newJourneyDate).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        Swal.fire('Success!', 'Your journey has been successfully rescheduled to ' + this.newJourneyDate, 'success').then(() => {
          this.router.navigateByUrl('/');
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to reschedule ticket.', 'error');
      }
    });
  }

  cancelTicket() {
    Swal.fire({
      title: 'Cancel Ticket?',
      text: "To get your refund, you MUST register an account on our website using the email: " + this.guestEmail + " so we can credit your Wallet.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'I Understand, Cancel It'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.bookingService.cancelGuestTicket(this.transactionId, this.guestEmail).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            Swal.fire(
              'Cancelled!',
              'Ticket cancelled. Please register an account with your email to claim your wallet refund.',
              'success'
            ).then(() => {
              this.router.navigateByUrl('/login'); 
            });
          },
          error: (err: any) => {
            this.isLoading = false;
            Swal.fire('Error', 'Failed to cancel ticket.', 'error');
          }
        });
      }
    });
  }
}