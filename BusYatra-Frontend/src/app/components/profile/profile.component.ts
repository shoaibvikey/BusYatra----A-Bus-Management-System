import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: any = {};
  
  // --- NEW LOADING TRACKER ---
  isLoading: boolean = false;

  private userService = inject(UserService);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    }
  }

  onUpdate() {
    // 1. Turn the spinner ON
    this.isLoading = true;

    this.userService.updateProfile(this.user.id, this.user).subscribe({
      next: (res) => {
        // 2. Turn the spinner OFF on success
        this.isLoading = false;

        localStorage.setItem('loggedUser', JSON.stringify(res));
        
        Swal.fire({
          title: 'Profile Updated!',
          text: 'Your profile details have been successfully saved.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        // 3. Turn the spinner OFF on error
        this.isLoading = false;

        Swal.fire({
          title: 'Update Failed',
          text: 'There was a problem updating your profile. Please try again.',
          icon: 'error',
          confirmButtonColor: '#0d6efd'
        });
        console.error(err);
      }
    });
  }
}