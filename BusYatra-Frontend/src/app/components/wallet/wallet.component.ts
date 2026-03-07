import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet.component.html'
})
export class WalletComponent implements OnInit {
  user: any = {};
  
  // --- NEW LOADING TRACKER ---
  isLoading: boolean = false;

  private userService = inject(UserService);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    }
  }

  addMoney(amountInput: HTMLInputElement) {
    const amountStr = amountInput.value;
    const amount = parseFloat(amountStr);
    
    if (!amount || amount <= 0) {
      Swal.fire({
        title: 'Invalid Amount',
        text: 'Please enter a valid amount greater than 0.',
        icon: 'warning',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }

    // 1. Turn the spinner ON
    this.isLoading = true;

    this.userService.addWalletMoney(this.user.id, amount).subscribe({
      next: (updatedUser) => {
        // 2. Turn the spinner OFF and clear input
        this.isLoading = false;
        amountInput.value = '';
        
        this.user = updatedUser;
        localStorage.setItem('loggedUser', JSON.stringify(updatedUser));
        
        Swal.fire({
          title: 'Money Added!',
          text: `Successfully added ₹${amount} to your wallet!`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        // 3. Turn the spinner OFF on error
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