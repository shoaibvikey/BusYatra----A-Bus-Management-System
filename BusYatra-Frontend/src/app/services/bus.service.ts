import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private apiUrl = 'https://busyatra-a-bus-management-system.onrender.com/api/users';

  constructor(private http: HttpClient) { }

  // Matches @GetMapping("/search")
  searchBuses(source: string, destination: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?source=${source}&destination=${destination}`);
  }

  // Matches @GetMapping("/all")
  getAllBuses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  // Matches @PostMapping("/add")
  addBus(busData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, busData);
  }

  // Matches @DeleteMapping("/remove/{id}") - Adding this now so your delete button works later!
  deleteBus(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${id}`, { responseType: 'text' });
  }

  // Add this below your existing addBus and deleteBus methods!
  updateBus(id: number, busData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, busData);
  }
}