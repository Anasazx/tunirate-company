import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyDashboardResponse } from '../../models/companyDashboardDTO/companyDashboardResponse.model';
import { CompanyDashboardService } from '../../../../core/services/companyDashboardService/company-dashboard.service';


@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-dashboard.component.html',
  styleUrl: './company-dashboard.component.css'
})
export class CompanyDashboardComponent implements OnInit {

  loading = false;

  dashboard: CompanyDashboardResponse | null = null;

    recentReviews = [
    {
      user: 'Ahmed',
      rating: 5,
      comment: 'Amazing product quality!',
      product: 'iPhone 15'
    },
    {
      user: 'Sara',
      rating: 4,
      comment: 'Good but a bit expensive',
      product: 'MacBook Pro'
    },
    {
      user: 'Youssef',
      rating: 5,
      comment: 'Excellent service!',
      product: 'AirPods Pro'
    }
  ];

  constructor(private dashboardService: CompanyDashboardService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;

    this.dashboardService.getMyCompanyDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
