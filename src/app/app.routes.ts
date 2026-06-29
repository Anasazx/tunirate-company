import { Routes } from '@angular/router';
import { CompanyDashboardComponent } from './features/dashboard/pages/company-dashboard/company-dashboard.component';
import { CompanyReviewsManagementComponent } from './features/reviews/pages/company-reviews-management/company-reviews-management.component';
import { CompanyProductsManagementComponent } from './features/products/pages/company-products/products-management/company-products-management.component';
import { CompanySettingsManagementComponent } from './features/settings/pages/company-settings-management/company-settings-management.component';
import { CompanyTeamManagementComponent } from './features/team/pages/company-team-management/company-team-management.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { CompanyMainComponent } from './core/layout/company-main/company-main.component';
import {CompanyNewProductComponent} from './features/products/pages/company-products/company-new-product/company-new-product.component';

export const routes: Routes = [


  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    component: CompanyMainComponent,
    children: [
      { path: '', component: CompanyDashboardComponent },
      { path: 'team', component: CompanyTeamManagementComponent },
      { path: 'reviews', component: CompanyReviewsManagementComponent },
      {
        path: 'products',
        component: CompanyProductsManagementComponent,
        children: [
          { path: 'new', component: CompanyNewProductComponent },
        ]
      },
      { path: 'settings', component: CompanySettingsManagementComponent },
    ],
  },
  {
     path: '**',
     redirectTo: '/'
  },

];
