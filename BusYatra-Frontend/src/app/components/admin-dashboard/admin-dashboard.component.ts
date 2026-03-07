import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusService } from '../../services/bus.service';
import { UserService } from '../../services/user.service';
import { BookingService } from '../../services/booking.service';
import { FeedbackService } from '../../services/feedback.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  
  buses: any[] = [];
  allBookings: any[] = [];
  inactiveUsers: any[] = [];
  allFeedback: any[] = [];
  
  // Variables for Time-Based Reports
  filteredBookings: any[] = [];
  timeFilter: string = 'ALL';
  lastMonthProfit: number = 0;
  totalProfit: number = 0;

  frequentRoute: string = 'Calculating...';
  preferredBus: string = 'Loading...';
  
  isEditMode: boolean = false;
  editBusId: number | null = null;
  selectedBooking: any = null;
  newReservationStatus: string = '';

  // --- NEW LOADING TRACKERS ---
  isSavingBus: boolean = false;
  isUpdatingStatus: boolean = false;

  // Driver fields included as per requirements
  newBus: any = {
    busName: '', source: '', destination: '', departureTime: '', arrivalTime: '', 
    totalSeats: 24, fare: 0, driverName: '', driverContact: ''
  };

  constructor(
    public userService: UserService, 
    private bookingService: BookingService,
    private busService: BusService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit() {
    this.loadAllBuses();
    this.loadAdminData();
    this.loadFeedback();
  }

  loadAdminData() {
    this.userService.getTotalProfits().subscribe({
      next: (profit: any) => this.totalProfit = profit,
      error: (err: any) => console.error(err)
    });

    this.userService.getInactiveUsers().subscribe({
      next: (users: any) => this.inactiveUsers = users,
      error: (err: any) => console.error(err)
    });

    this.userService.getPreferredBus().subscribe({
      next: (res: any) => this.preferredBus = res.type,
      error: (err: any) => console.error(err)
    });

    this.userService.getFrequentRoute().subscribe({
      next: (res: any) => this.frequentRoute = res.route,
      error: (err: any) => console.error(err)
    });

    this.bookingService.getAllBookings().subscribe({
      next: (res: any[]) => {
        this.allBookings = res;
        this.applyTimeFilter();
        this.calculateLastMonthProfit();
      },
      error: (err: any) => console.error('Failed to load bookings', err)
    });
  }

  loadFeedback() {
    this.feedbackService.getAllFeedback().subscribe({
      next: (data) => this.allFeedback = data,
      error: (err) => console.error("Error loading feedback", err)
    });
  }

  applyTimeFilter() {
    const today = new Date();
    this.filteredBookings = this.allBookings.filter(b => {
      if (this.timeFilter === 'ALL') return true;
      const journeyDate = new Date(b.journeyDate);
      const diffTime = Math.abs(journeyDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (this.timeFilter === 'DAILY') {
        return journeyDate.toDateString() === today.toDateString();
      } else if (this.timeFilter === 'WEEKLY') {
        return diffDays <= 7;
      } else if (this.timeFilter === 'MONTHLY') {
        return journeyDate.getMonth() === today.getMonth() && journeyDate.getFullYear() === today.getFullYear();
      }
      return true;
    });
  }

  calculateLastMonthProfit() {
    const today = new Date();
    const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
    const yearOfLastMonth = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

    this.lastMonthProfit = this.allBookings
      .filter(b => b.status === 'BOOKED')
      .filter(b => {
        const d = new Date(b.journeyDate);
        return d.getMonth() === lastMonth && d.getFullYear() === yearOfLastMonth;
      })
      .reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  }

  loadAllBuses() {
    this.busService.getAllBuses().subscribe({
      next: (data) => this.buses = data,
      error: (err) => console.error(err)
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.editBusId = null;
    this.newBus = { busName: '', source: '', destination: '', departureTime: '', arrivalTime: '', totalSeats: 24, fare: 0, driverName: '', driverContact: '' };
  }

  onEditBus(bus: any) {
    this.isEditMode = true;
    this.editBusId = bus.id;
    this.newBus = { ...bus }; 
  }

  saveBus() {
    // 1. Turn the spinner ON
    this.isSavingBus = true;

    const action = this.isEditMode && this.editBusId ? 
                   this.busService.updateBus(this.editBusId, this.newBus) : 
                   this.busService.addBus(this.newBus);

    action.subscribe({
      next: (res) => {
        // 2. Turn the spinner OFF and close modal
        this.isSavingBus = false;
        this.closeModal('addBusModal');
        
        Swal.fire({ title: 'Success!', text: 'Bus fleet updated successfully.', icon: 'success', timer: 2000, showConfirmButton: false });
        this.loadAllBuses();
      },
      error: (err) => {
        // 3. Turn the spinner OFF if there is an error
        this.isSavingBus = false;
        Swal.fire('Error!', 'Failed to save bus details.', 'error');
        console.error(err);
      }
    });
  }

  onDeleteBus(busId: number) {
    Swal.fire({
      title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.busService.deleteBus(busId).subscribe({
          next: (res) => { Swal.fire('Deleted!', 'The bus has been removed.', 'success'); this.loadAllBuses(); },
          error: (err) => { Swal.fire('Cannot Delete!', 'This bus has active or past reservations attached to it.', 'warning'); }
        });
      }
    });
  }

  openUpdateStatusModal(booking: any) {
    this.selectedBooking = booking;
    this.newReservationStatus = booking.status; 
  }

  saveReservationStatus() {
    if (this.selectedBooking && this.newReservationStatus) {
      // 1. Turn the spinner ON
      this.isUpdatingStatus = true;
      this.selectedBooking.status = this.newReservationStatus;

      this.bookingService.updateBooking(this.selectedBooking.id, this.selectedBooking).subscribe({
        next: () => {
          // 2. Turn the spinner OFF and close modal
          this.isUpdatingStatus = false;
          this.closeModal('updateStatusModal');

          Swal.fire({ title: 'Success!', text: 'Status updated.', icon: 'success', timer: 2000, showConfirmButton: false });
          this.loadAdminData(); 
        },
        error: (err) => {
          this.isUpdatingStatus = false;
          Swal.fire('Error!', 'Failed to update.', 'error');
        }
      });
    }
  }

  // Helper method to close Bootstrap modals safely from code
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