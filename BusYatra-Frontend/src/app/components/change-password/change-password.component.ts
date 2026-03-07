import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
  passwords = { current: '', new: '', confirm: '' };
  
  // --- NEW LOADING TRACKER ---
  isLoading: boolean = false;
  
  private userService = inject(UserService);

  onChangePassword() {
    // 1. Password Mismatch Warning Alert
    if (this.passwords.new !== this.passwords.confirm) {
      Swal.fire({
        title: 'Mismatch!',
        text: 'Your new passwords do not match. Please try again.',
        icon: 'warning',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }
    
    // 2. Turn the spinner ON
    this.isLoading = true;
    
    const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    
    this.userService.changePassword(user.id, this.passwords.current, this.passwords.new).subscribe({
      next: (res) => {
        // 3. Turn the spinner OFF on success
        this.isLoading = false;
        
        Swal.fire({
          title: 'Success!',
          text: 'Your password has been updated successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        this.passwords = { current: '', new: '', confirm: '' }; // clear form
      },
      error: (err) => {
        // 4. Turn the spinner OFF on error
        this.isLoading = false;
        
        Swal.fire({
          title: 'Update Failed',
          text: err.error || "Failed to update password. Please check your current password.",
          icon: 'error',
          confirmButtonColor: '#0d6efd'
        });
      }
    });
  }
}