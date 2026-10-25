import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyDashboardResponse } from '../../models/companyDashboardDTO/companyDashboardResponse.model';
import { CompanyDashboardService } from '../../services/companyDashboardService/company-dashboard.service';
import {MinimizedReviewResponse} from '../../../reviews/models/reviewDTO/minimizedReviewResponse.model';


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



  constructor(private dashboardService: CompanyDashboardService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;

    this.dashboardService.getMyCompanyDashboard().subscribe({
      next: (data) => {
        console.log("this is the response; ",data);
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
