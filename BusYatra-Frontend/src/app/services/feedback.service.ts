import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:8080/api/feedback';
  private http = inject(HttpClient);

  // Submit new feedback (For Contact Us & Booking pages)
  submitFeedback(feedbackData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, feedbackData);
  }

  // Get all feedback (For Admin Dashboard)
  getAllFeedback(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }
}