import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SearchBusesComponent } from './components/search-buses/search-buses.component';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { BookingComponent } from './components/booking/booking.component';
import { authGuard } from './guards/auth.guard';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { CancelTicketComponent } from './components/cancel-ticket/cancel-ticket.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default home page
  { path: 'search', component: SearchBusesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'cancel-ticket', component: CancelTicketComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'bookings', pathMatch: 'full' }, // Default tab
      { path: 'bookings', component: MyBookingsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'wallet', component: WalletComponent }
    ]
  },
  { path: '**', redirectTo: '' } // Redirect unknown URLs to home
];