import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-company-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './company-header.component.html',
  styleUrl: './company-header.component.css'
})
export class CompanyHeaderComponent {

  currentUser$: any;

  constructor(public authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;
  }



  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
