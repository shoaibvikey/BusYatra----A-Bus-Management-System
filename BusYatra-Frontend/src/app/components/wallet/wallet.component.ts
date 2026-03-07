import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Added FormsModule and NgForm
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule], // Ensure FormsModule is here
  templateUrl: './wallet.component.html'
})
export class WalletComponent implements OnInit {
  user: any = {};
  
  // Variable to bind to the input field
  addAmount: number | null = null; 
  
  isLoading: boolean = false;

  private userService = inject(UserService);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    }
  }

  // Pass the NgForm reference in
  addMoney(form: NgForm) {
    // 1. Validation Check: Stop if the form has errors or amount is 0/negative
    if (form.invalid || !this.addAmount || this.addAmount <= 0) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }

    // 2. Turn the spinner ON
    this.isLoading = true;
    const amount = this.addAmount;

    this.userService.addWalletMoney(this.user.id, amount).subscribe({
      next: (updatedUser) => {
        // 3. Turn the spinner OFF and reset form
        this.isLoading = false;
        
        this.user = updatedUser;
        localStorage.setItem('loggedUser', JSON.stringify(updatedUser));
        
        Swal.fire({
          title: 'Money Added!',
          text: `Successfully added ₹${amount} to your wallet!`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        form.resetForm(); // Clears input and red validation lines
      },
      error: (err) => {
        // 4. Turn the spinner OFF on error
        this.isLoading = false;
        
        Swal.fire({
          title: 'Transaction Failed',
          text: 'Failed to add money to your wallet. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#0d6efd'
        });
        console.error(err);
      }
    });
  }
}