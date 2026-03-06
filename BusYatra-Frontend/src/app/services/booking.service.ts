import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'https://busyatra-a-bus-management-system.onrender.com/api/bookings';

  constructor(private http: HttpClient) { }

  createBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/book`, bookingData);
  }

  getUserBookings(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  cancelBooking(bookingId: number, userId: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/cancel/authorized?bookingId=${bookingId}&userId=${userId}`, {}, { responseType: 'text' });
  }

  getOccupiedSeats(busId: number, date: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/occupied-seats?busId=${busId}&date=${date}`);
  }

  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`); 
  }

  updateBooking(id: number, bookingData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, bookingData);
  }

  // --- Guest Endpoints ---

  getGuestBooking(transactionId: string, email: string) {
    return this.http.get(`${this.apiUrl}/guest`, { params: { transactionId, email } });
  }

  rescheduleGuestBooking(transactionId: string, email: string, newDate: string) {
    return this.http.post(`${this.apiUrl}/guest/reschedule`, null, { params: { transactionId, email, newDate } });
  }

  cancelGuestTicket(transactionId: string, email: string) {
    return this.http.post(`${this.apiUrl}/cancel/unauthorized`, null, {
      params: { transactionId: transactionId, email: email }
    });
  }
}