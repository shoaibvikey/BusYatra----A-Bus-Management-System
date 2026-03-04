import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2'; // IMPORTED SWEETALERT

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: any = {};
  private userService = inject(UserService);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    }
  }

  onUpdate() {
    this.userService.updateProfile(this.user.id, this.user).subscribe({
      next: (res) => {
        // Update local storage with the new user data
        localStorage.setItem('loggedUser', JSON.stringify(res));
        
        // Success SweetAlert
        Swal.fire({
          title: 'Profile Updated!',
          text: 'Your profile details have been successfully saved.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        // Error SweetAlert
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