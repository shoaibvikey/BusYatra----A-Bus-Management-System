import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { BusService } from '../../services/bus.service';
import { BookingService } from '../../services/booking.service';
import { forkJoin } from 'rxjs';

import { BookingComponent } from '../booking/booking.component'; 

@Component({
  selector: 'app-search-buses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BookingComponent],
  templateUrl: './search-buses.component.html',
  styleUrl: './search-buses.component.css'
})
export class SearchBusesComponent implements OnInit {
  fromCity: string = '';
  toCity: string = '';
  travelDate: string = '';
  returnDate: string = ''; 
  
  minDate: string = ''; 
  hasSearched: boolean = false; 
  
  buses: any[] = []; 
  returnBuses: any[] = []; 

  // --- LOADING TRACKER ---
  isLoading: boolean = false;

  selectedBusForModal: any = null;

  availableCities: string[] = [
    'Ahmedabad', 'Bangalore', 'Chandigarh', 'Chennai', 'Darjeeling', 'Delhi', 'Goa',
    'Hyderabad', 'Jaipur', 'Jodhpur', 'Kanpur', 'Kochi', 'Kolkata', 'Lucknow',
    'Madurai', 'Manali', 'Mumbai', 'Nagpur', 'Patna', 'Pune', 'Siliguri', 'Surat',
    'Udaipur', 'Varanasi'
  ];
  
  filteredFromCities: string[] = [];
  filteredToCities: string[] = [];
  showFromDropdown: boolean = false;
  showToDropdown: boolean = false;

  private busService = inject(BusService); 
  private router = inject(Router);
  private bookingService = inject(BookingService);

  ngOnInit() {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    this.minDate = `${year}-${month}-${day}`;
    this.travelDate = this.minDate; 
  }

  filterFromCities() {
    this.filteredFromCities = this.fromCity 
      ? this.availableCities.filter(c => c.toLowerCase().includes(this.fromCity.toLowerCase()))
      : this.availableCities;
    this.showFromDropdown = true;
  }

  selectFromCity(city: string) {
    this.fromCity = city;
    this.showFromDropdown = false;
  }

  hideFromDropdown() { setTimeout(() => this.showFromDropdown = false, 200); }

  filterToCities() {
    this.filteredToCities = this.toCity 
      ? this.availableCities.filter(c => c.toLowerCase().includes(this.toCity.toLowerCase()))
      : this.availableCities;
    this.showToDropdown = true;
  }

  selectToCity(city: string) {
    this.toCity = city;
    this.showToDropdown = false;
  }

  hideToDropdown() { setTimeout(() => this.showToDropdown = false, 200); }

  onSearch() {
    if (!this.fromCity || !this.toCity || !this.travelDate) return; 
    
    // 1. Reset state and start loading
    this.isLoading = true;
    this.hasSearched = true; 
    this.buses = [];
    this.returnBuses = [];

    // Outbound Search
    this.busService.searchBuses(this.fromCity, this.toCity).subscribe({
      next: (busesRes: any[]) => {
        if (busesRes.length === 0) {
          this.buses = [];
          if (!this.returnDate) this.isLoading = false; 
        } else {
          // Fetch seat counts for each bus
          const seatRequests = busesRes.map(bus => this.bookingService.getOccupiedSeats(bus.id, this.travelDate));
          forkJoin(seatRequests).subscribe({
            next: (allBookings: any[][]) => {
              this.buses = busesRes.map((bus, index) => {
                const busBookings = allBookings[index] || [];
                let occupiedCount = 0;
                busBookings.forEach((booking: any) => {
                  if (typeof booking === 'string') {
                     occupiedCount += booking.split(',').filter(s => s.trim() !== '').length;
                  } else if (booking && booking.seatNumbers) {
                     occupiedCount += booking.seatNumbers.split(',').filter((s: string) => s.trim() !== '').length;
                  }
                });
                return { ...bus, availableSeats: 24 - occupiedCount };
              });
              
              // Only turn off if not waiting for return buses
              if (!this.returnDate) this.isLoading = false; 
            },
            error: () => this.isLoading = false
          });
        }
      },
      error: (err) => { 
        console.error("Error", err); 
        this.isLoading = false;
      }
    });

    // Return Search (Logic improved to handle loading state separately)
    if (this.returnDate) {
      this.busService.searchBuses(this.toCity, this.fromCity).subscribe({
        next: (returnBusesRes: any[]) => {
          if (returnBusesRes.length === 0) {
            this.returnBuses = [];
            this.isLoading = false;
          } else {
            const returnSeatRequests = returnBusesRes.map(bus => this.bookingService.getOccupiedSeats(bus.id, this.returnDate));
            forkJoin(returnSeatRequests).subscribe({
              next: (allReturnBookings: any[][]) => {
                this.returnBuses = returnBusesRes.map((bus, index) => {
                  const busBookings = allReturnBookings[index] || [];
                  let occupiedCount = 0;
                  busBookings.forEach((booking: any) => {
                    if (typeof booking === 'string') {
                       occupiedCount += booking.split(',').filter(s => s.trim() !== '').length;
                    } else if (booking && booking.seatNumbers) {
                       occupiedCount += booking.seatNumbers.split(',').filter((s: string) => s.trim() !== '').length;
                    }
                  });
                  return { ...bus, availableSeats: 24 - occupiedCount };
                });
                this.isLoading = false; 
              },
              error: () => this.isLoading = false
            });
          }
        },
        error: (err) => { 
          console.error("Return Search Error", err); 
          this.isLoading = false;
        }
      });
    }
  }

  openBookingModal(bus: any, journeyDate: string) {
    this.selectedBusForModal = null; 
    setTimeout(() => {
      localStorage.setItem('selectedBus', JSON.stringify(bus));
      localStorage.setItem('travelDate', journeyDate); 
      this.selectedBusForModal = bus; 
    }, 50);
  }

  closeBookingModal() {
    this.selectedBusForModal = null;
  }
}