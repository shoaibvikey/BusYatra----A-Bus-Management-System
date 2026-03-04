import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2'; // IMPORTED SWEETALERT

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet.component.html'
})
export class WalletComponent implements OnInit {
  user: any = {};
  private userService = inject(UserService);

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    }
  }

  addMoney(amountStr: string) {
    const amount = parseFloat(amountStr);
    
    // 1. Validation Warning Alert
    if (!amount || amount <= 0) {
      Swal.fire({
        title: 'Invalid Amount',
        text: 'Please enter a valid amount greater than 0.',
        icon: 'warning',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }

    this.userService.addWalletMoney(this.user.id, amount).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        // Update local storage so the navbar reflects the new balance instantly if needed
        localStorage.setItem('loggedUser', JSON.stringify(updatedUser));
        
        // 2. Success Alert
        Swal.fire({
          title: 'Money Added!',
          text: `Successfully added ₹${amount} to your wallet!`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        // 3. Error Alert
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