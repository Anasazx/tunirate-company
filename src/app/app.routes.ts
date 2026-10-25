import { Routes } from '@angular/router';
import { CompanyDashboardComponent } from './features/dashboard/pages/company-dashboard/company-dashboard.component';
import { CompanyReviewsManagementComponent } from './features/reviews/pages/company-reviews-management/company-reviews-management.component';
import { CompanyProductsManagementComponent } from './features/products/pages/products-management/company-products-management.component';
import { CompanySettingsManagementComponent } from './features/settings/pages/company-settings-management/company-settings-management.component';
import { CompanyTeamManagementComponent } from './features/team/pages/company-team-management/company-team-management.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { CompanyMainComponent } from './core/layout/company-main/company-main.component';
import {CompanyNewProductComponent} from './features/products/pages/company-new-product/company-new-product.component';
import {EditProductComponent} from './features/products/pages/edit-product/edit-product.component';
import {ProductDetailsComponent} from './features/products/pages/product-details/product-details.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [


  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: CompanyMainComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: CompanyDashboardComponent },
      { path: 'team', component: CompanyTeamManagementComponent },
      { path: 'reviews', component: CompanyReviewsManagementComponent },
      { path: 'products', component: CompanyProductsManagementComponent },
      { path: 'products/new', component: CompanyNewProductComponent },
      { path: 'products/edit/:id', component: EditProductComponent },
      { path: 'products/:id', component: ProductDetailsComponent },
      { path: 'settings', component: CompanySettingsManagementComponent },
    ],
  },
  {
     path: '**',
     redirectTo: '/'
  },

];
