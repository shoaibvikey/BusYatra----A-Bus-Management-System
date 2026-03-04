import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // --- BASE URLS ---
  private apiUrl = 'http://localhost:8080/api/users';
  private adminUrl = 'http://localhost:8080/api/admin'; // <-- This was the missing piece!
  private http = inject(HttpClient);

  // --- AUTH METHODS ---
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // --- CUSTOMER DASHBOARD METHODS ---
  updateProfile(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/profile`, userData);
  }

  changePassword(userId: number, currentPwd: string, newPwd: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/change-password?currentPwd=${currentPwd}&newPwd=${newPwd}`, {}, { responseType: 'text' });
  }

  addWalletMoney(userId: number, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/wallet/add?amount=${amount}`, {});
  }

  // --- ADMIN ANALYTICS METHODS ---
  getTotalProfits(): Observable<any> {
    return this.http.get(`${this.adminUrl}/profits`);
  }

  getInactiveUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/inactive-users`);
  }

  getFrequentRoute(): Observable<any> {
    return this.http.get(`${this.adminUrl}/frequent-route`);
  }

  getPreferredBus(): Observable<any> {
  return this.http.get(`${this.adminUrl}/preferred-bus`);
}
}