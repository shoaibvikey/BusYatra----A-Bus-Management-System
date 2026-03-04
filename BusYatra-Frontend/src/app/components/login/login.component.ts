import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2'; // IMPORTED SWEETALERT

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isLoginView = true;
  
  // Objects to hold form data
  loginObj = { email: '', password: '' };
  registerObj = { firstName: '', lastName: '', email: '', contactNo: '', password: '' };

  private userService = inject(UserService);
  private router = inject(Router);

  toggleView() {
    this.isLoginView = !this.isLoginView;
  }

  onLogin() {
    this.userService.login(this.loginObj).subscribe({
      next: (response: any) => {
        // UPDATED: SweetAlert Success
        Swal.fire({
          title: 'Welcome Back!',
          text: 'You have logged in successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        // 1. Save the user data to localStorage
        localStorage.setItem('loggedUser', JSON.stringify(response));

        // 2. The "Traffic Cop" Routing Logic
        if (response.email === 'admin@travels.com') { // Change this to your admin email
          localStorage.setItem('userRole', 'admin'); 
          this.router.navigateByUrl('/admin');       
        } else {
          localStorage.setItem('userRole', 'customer');
          this.router.navigateByUrl('/search');      
        }
      },
      error: (err: any) => {
        // UPDATED: SweetAlert Error
        Swal.fire({
          title: 'Login Failed!',
          text: 'Incorrect email or password. Please try again.',
          icon: 'error',
          confirmButtonColor: '#0d6efd'
        });
        console.error(err);
      }
    });
  }

  onRegister() {
    this.userService.register(this.registerObj).subscribe({
      next: (response) => {
        // UPDATED: SweetAlert Registration Success
        Swal.fire({
          title: 'Registration Successful!',
          text: 'Welcome! You can now log in.',
          icon: 'success',
          confirmButtonColor: '#0d6efd'
        });
        this.toggleView(); // Switch back to login view automatically
      },
      error: (err) => {
        // UPDATED: SweetAlert Registration Error
        Swal.fire({
          title: 'Registration Failed',
          text: 'There was an issue creating your account. Please try again.',
          icon: 'error',
          confirmButtonColor: '#0d6efd'
        });
        console.error(err);
      }
    });
  }
}