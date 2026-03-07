import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2'; 

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

  // --- NEW LOADING TRACKER ---
  isLoading: boolean = false;

  private userService = inject(UserService);
  private router = inject(Router);

  toggleView() {
    this.isLoginView = !this.isLoginView;
  }

  onLogin() {
    // 1. Turn spinner ON
    this.isLoading = true;

    this.userService.login(this.loginObj).subscribe({
      next: (response: any) => {
        // 2. Turn spinner OFF on success
        this.isLoading = false;

        Swal.fire({
          title: 'Welcome Back!',
          text: 'You have logged in successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        localStorage.setItem('loggedUser', JSON.stringify(response));

        if (response.email === 'admin@travels.com') { 
          localStorage.setItem('userRole', 'admin'); 
          this.router.navigateByUrl('/admin');       
        } else {
          localStorage.setItem('userRole', 'customer');
          this.router.navigateByUrl('/search');      
        }
      },
      error: (err: any) => {
        // 3. Turn spinner OFF on error
        this.isLoading = false;

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
    // 1. Turn spinner ON
    this.isLoading = true;

    this.userService.register(this.registerObj).subscribe({
      next: (response) => {
        // 2. Turn spinner OFF on success
        this.isLoading = false;

        Swal.fire({
          title: 'Registration Successful!',
          text: 'Welcome! You can now log in.',
          icon: 'success',
          confirmButtonColor: '#0d6efd'
        });
        this.toggleView(); 
      },
      error: (err) => {
        // 3. Turn spinner OFF on error
        this.isLoading = false;

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