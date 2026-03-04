import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; // 1. Import this tool

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID); // 2. Get the current platform

  // 3. ONLY run this code if we are in the browser!
  if (isPlatformBrowser(platformId)) {
    const loggedUserStr = localStorage.getItem('loggedUser');

    if (loggedUserStr) {
      const user = JSON.parse(loggedUserStr);
      
      // Check if the logged-in user is our designated Admin
      if (user.email === 'admin@travels.com') {
        return true; // Let them in!
      } else {
        alert("Access Denied! You are logged in as a Customer, not an Admin.");
        router.navigateByUrl('/search');
        return false; // Block them!
      }
    }

    // If nobody is logged in at all
    alert("Please login first to access the Admin Dashboard.");
    router.navigateByUrl('/login');
    return false;
  }

  // If running on the server during the initial load, just block it temporarily
  return false; 
};