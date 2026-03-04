import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import Swal from 'sweetalert2'; // IMPORTED SWEETALERT

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'BusYatra'; // Updated to match your Navbar branding
  private router = inject(Router);

  get isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('loggedUser');
    }
    return false;
  }

  get userFullName(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('loggedUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return `${user.firstName} ${user.lastName}`; 
      }
    }
    return '';
  }

  get isAdmin(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userRole') === 'admin';
    }
    return false;
  }

  // UPDATED: SweetAlert Logout Confirmation
  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear storage
        localStorage.removeItem('loggedUser');
        localStorage.removeItem('userRole');
        
        // Show success message
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        // Redirect
        this.router.navigateByUrl('/login');
      }
    });
  }

  get walletBalance(): number {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('loggedUser');
      return userStr ? JSON.parse(userStr).walletBalance : 0;
    }
    return 0;
  }
}