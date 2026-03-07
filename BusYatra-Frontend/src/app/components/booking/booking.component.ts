import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent implements OnInit {
  seats: any[] = [];
  selectedSeats: number[] = [];
  selectedBus: any = null;
  loggedInUser: any = null;
  totalFare: number = 0;
  
  travelDate: string = '';

  guestName: string = ''; 
  guestEmail: string = '';
  guestPhone: string = '';

  withDriver: boolean = true;
  securityDeposit: number = 0;
  coachFacilities: string[] = ['A/C', 'WiFi', 'Recliner Seats', 'Water Bottle'];

  isBooking: boolean = false;

  private router = inject(Router);
  private bookingService = inject(BookingService);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const busStr = localStorage.getItem('selectedBus');
      this.travelDate = localStorage.getItem('travelDate') || ''; 

      if (busStr && this.travelDate) {
        this.selectedBus = JSON.parse(busStr);
        this.loadOccupiedSeats(); 
      } else {
        Swal.fire('Error', 'No bus or date selected!', 'error');
        this.closeModalOnly();
      }

      const userStr = localStorage.getItem('loggedUser');
      if (userStr) {
        this.loggedInUser = JSON.parse(userStr);
      }
    }
  }

  loadOccupiedSeats() {
    this.bookingService.getOccupiedSeats(this.selectedBus.id, this.travelDate).subscribe({
      next: (takenSeats: string[]) => {
        let allTaken: string[] = [];
        takenSeats.forEach(bookingStr => {
           if(bookingStr) {
              allTaken = allTaken.concat(bookingStr.split(','));
           }
        });

        this.seats = Array.from({ length: 24 }, (_, i) => {
          const seatNum = (i + 1).toString();
          return {
            number: i + 1,
            status: allTaken.includes(seatNum) ? 'booked' : 'available'
          };
        });
      },
      error: (err) => {
        console.error("Failed to load occupied seats", err);
        this.seats = Array.from({ length: 24 }, (_, i) => ({
          number: i + 1,
          status: 'available'
        }));
      }
    });
  }

  toggleSeat(seat: any) {
    if (seat.status === 'booked') return;
    if (seat.status === 'selected') {
      seat.status = 'available';
      this.selectedSeats = this.selectedSeats.filter(s => s !== seat.number);
    } else {
      seat.status = 'selected';
      this.selectedSeats.push(seat.number);
    }
    this.calculateFare();
  }

  onDriverOptionChange() {
    if (!this.withDriver) {
      this.securityDeposit = 5000; 
    } else {
      this.securityDeposit = 0;
    }
    this.calculateFare();
  }

  calculateFare() {
    if (this.selectedBus) {
      this.totalFare = (this.selectedSeats.length * this.selectedBus.fare) + this.securityDeposit;
    }
  }

  goToLogin() {
    this.closeModalAndNavigate('/login');
  }

  // --- 1. WALLET PAYMENT LOGIC ---
  payWithWallet() {
    if (this.selectedSeats.length === 0) {
      Swal.fire('Wait!', 'Please select at least one seat.', 'warning');
      return;
    }

    // CHECK WALLET BALANCE
    if (this.loggedInUser.walletBalance < this.totalFare) {
      Swal.fire({
        title: 'Insufficient Funds',
        text: `Your wallet balance is ₹${this.loggedInUser.walletBalance}, but the total fare is ₹${this.totalFare}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Add Money to Wallet',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.closeModalAndNavigate('/dashboard/wallet');
        }
      });
      return;
    }

    // If balance is sufficient, process the booking
    this.processBooking('Wallet');
  }

  // --- 2. RAZORPAY PAYMENT LOGIC ---
  async payWithRazorpay() {
    if (this.selectedSeats.length === 0) {
      Swal.fire('Wait!', 'Please select at least one seat.', 'warning');
      return;
    }

    if (!this.loggedInUser && (!this.guestName || !this.guestEmail || !this.guestPhone)) {
      Swal.fire('Guest Details Required', 'Please enter your name, email, and phone number to receive your ticket.', 'info');
      return;
    }

    const isRazorpayLoaded = await this.loadRazorpayScript();
    if (!isRazorpayLoaded) {
      Swal.fire('Error', 'Razorpay failed to load. Please check your connection.', 'error');
      return;
    }

    const options = {
      key: 'rzp_test_SOPJGHgnqfvBEz', // <-- Replace with your free Razorpay Test Key if you have one
      amount: this.totalFare * 100, // Amount is in paise (multiply by 100)
      currency: 'INR',
      name: 'BusYatra Travels',
      description: 'E-Ticket Reservation',
      image: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', // Bus Icon
      handler: (response: any) => {
        // Payment Succeeded!
        this.processBooking('Razorpay', response.razorpay_payment_id);
      },
      prefill: {
        name: this.loggedInUser ? `${this.loggedInUser.firstName} ${this.loggedInUser.lastName}` : this.guestName,
        email: this.loggedInUser ? this.loggedInUser.email : this.guestEmail,
        contact: this.loggedInUser ? this.loggedInUser.contactNo : this.guestPhone
      },
      theme: {
        color: '#0d6efd'
      }
    };

    const rzp = new (window as any).Razorpay(options);
    
    rzp.on('payment.failed', (response: any) => {
      Swal.fire('Payment Failed', response.error.description, 'error');
    });

    rzp.open();
  }

  // Helper method to dynamically load Razorpay script
  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // --- 3. MASTER BOOKING PROCESSOR ---
  private processBooking(paymentMethod: string, transactionId?: string) {
    this.isBooking = true;

    const bookingPayload: any = {
      bus: { id: this.selectedBus.id },
      journeyDate: this.travelDate, 
      seatNumbers: this.selectedSeats.join(','), 
      amountPaid: this.totalFare,
      status: "BOOKED",
      withDriver: this.loggedInUser ? this.withDriver : true, 
      securityDeposit: this.loggedInUser ? this.securityDeposit : 0.0,
      paymentMethod: paymentMethod,
      paymentId: transactionId || 'WALLET-TXN'
    };

    if (this.loggedInUser) {
      bookingPayload.user = { id: this.loggedInUser.id };
    } else {
      bookingPayload.guestName = this.guestName;
      bookingPayload.guestEmail = this.guestEmail;
      bookingPayload.guestPhone = this.guestPhone; 
    }

    this.bookingService.createBooking(bookingPayload).subscribe({
      next: (res: any) => {
        this.isBooking = false;
        
        // Frontend local balance deduction (optional, assuming backend handles real deduction)
        if (paymentMethod === 'Wallet' && this.loggedInUser) {
          this.loggedInUser.walletBalance -= this.totalFare;
          localStorage.setItem('loggedUser', JSON.stringify(this.loggedInUser));
        }

        Swal.fire({
          title: 'Booking Confirmed!',
          text: 'Transaction ID: ' + res.transactionId + (this.loggedInUser ? '' : '\n(Save this ID to check/cancel your ticket later!)'),
          icon: 'success',
          showCancelButton: true,
          confirmButtonColor: '#0d6efd',
          cancelButtonColor: '#198754', 
          confirmButtonText: this.loggedInUser ? 'View My Tickets' : 'Download Ticket',
          cancelButtonText: 'Book Return Trip',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            if(this.loggedInUser) {
              this.closeModalAndNavigate('/dashboard/bookings');
            } else {
              this.printGuestTicket(res);
              this.closeModalAndNavigate('/'); 
            }
          } else {
            this.closeModalOnly();
            const searchBtn = document.querySelector('button.btn-primary.w-100') as HTMLElement;
            if (searchBtn) searchBtn.click();
          }
        });
      },
      error: (err: any) => {
        this.isBooking = false;
        Swal.fire('Booking Failed', 'There was an error processing your ticket.', 'error');
        console.error(err);
      }
    });
  }

  printGuestTicket(booking: any) {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BusYatra-GuestTicket-${booking.transactionId}`;
    const ticketHtml = `
      <html>
        <head>
          <title>E-Ticket: ${booking.transactionId}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background-color: #f4f7f6; }
            .ticket-box { background: white; border: 2px dashed #0d6efd; border-radius: 10px; padding: 30px; max-width: 650px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .header h2 { color: #0d6efd; margin: 0; font-size: 28px; }
            .header p { color: #6c757d; margin: 5px 0 0 0; }
            .content-wrapper { display: flex; justify-content: space-between; align-items: center; }
            .details { flex-grow: 1; }
            .details p { font-size: 16px; margin: 10px 0; border-bottom: 1px solid #f8f9fa; padding-bottom: 8px; }
            .details strong { color: #343a40; display: inline-block; width: 150px; }
            .amount { font-size: 22px; color: #198754; font-weight: bold; }
            .qr-code { text-align: center; margin-left: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px; background: #fafafa; }
            .qr-code img { max-width: 120px; height: auto; }
            .qr-code small { display: block; margin-top: 8px; font-size: 12px; color: #6c757d; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #adb5bd; }
            @media print {
              body { background-color: white; padding: 0; }
              .ticket-box { box-shadow: none; border: 2px dashed #000; margin: 0; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-box">
            <div class="header">
              <h2>BusYatra Travels 🚌</h2>
              <p>Official Guest E-Ticket</p>
            </div>
            <div class="content-wrapper">
              <div class="details">
                <p><strong>Transaction ID:</strong> ${booking.transactionId}</p>
                <p><strong>Passenger Name:</strong> ${this.guestName}</p>
                <p><strong>Bus Operator:</strong> ${this.selectedBus.busName}</p>
                <p><strong>Route:</strong> ${this.selectedBus.source} to ${this.selectedBus.destination}</p>
                <p><strong>Journey Date:</strong> ${booking.journeyDate}</p>
                <p><strong>Seat Number(s):</strong> ${booking.seatNumbers}</p>
                <p><strong>Total Paid:</strong> <span class="amount">₹${booking.amountPaid}</span></p>
              </div>
              <div class="qr-code">
                <img src="${qrCodeUrl}" alt="Ticket QR Code">
                <small>Scan to Verify</small>
              </div>
            </div>
            <div class="footer">
              <p>Please present this E-Ticket along with a valid Government Photo ID at boarding.</p>
              <p>To cancel this ticket, visit our website and use your Transaction ID and Email.</p>
            </div>
          </div>
          <script>
            window.onload = function() { setTimeout(function() { window.print(); }, 500); }
          </script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(ticketHtml);
      printWindow.document.close();
    }
  }

  closeModalAndNavigate(url: string) {
    this.closeModalOnly();
    this.router.navigateByUrl(url);
  }

  closeModalOnly() {
    const closeBtn = document.querySelector('#seatModal .btn-close') as HTMLElement;
    if (closeBtn) {
      closeBtn.click();
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    }
  }
}