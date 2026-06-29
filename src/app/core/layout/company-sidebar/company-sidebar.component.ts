import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/authService/auth.service';
import { CompanyService } from '../../services/companyService/company.service';
import { SharedService } from '../../services/sharedService/shared.service';


@Component({
  selector: 'app-company-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './company-sidebar.component.html',
  styleUrl: './company-sidebar.component.css'
})
export class CompanySidebarComponent implements OnInit{

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    public sharedService: SharedService
  ) {}

  company: any;


  ngOnInit(): void {
    this.loadCompany();
  }



  menuItems = [
    {
      label: 'Dashboard',
      path: '',
      icon: 'dashboard'
    },
    {
      label: 'Reviews',
      path: '/reviews',
      icon: 'reviews'
    },
    {
      label: 'Products',
      path: '/products',
      icon: 'grid'
    },
    {
      label: 'Team Management',
      path: '/team',
      icon: 'users',
      headOnly: true
    },
    {
      label: 'Company Settings',
      path: '/settings',
      icon: 'settings',
      headOnly: true
    }
  ];


  loadCompany(){
    if (this.authService.isCompanyMember()) {
      this.companyService.getMyCompany().subscribe({
        next: company => {
          this.company = company;
        }
      });
    }
  }


  isHead(): boolean {
    return this.authService.getCompanyRole() === 'HEAD';
  }
}
