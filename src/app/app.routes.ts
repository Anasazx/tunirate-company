import { Routes } from '@angular/router';
import { ProductsManagementComponent } from './admin/admin-product/products-management/products-management.component';
import { DashboardComponent } from './admin/admin-dashboard/dashboard.component';
import { AdminMainComponent } from './admin/admin-layout/admin-main/admin-main.component';
import { EditCompanyComponent } from './admin/admin-company/edit-company/edit-company.component';
import { CompanyManagementComponent } from './admin/admin-company/company-management/company-management.component';
import { CompanyDashboardComponent } from './company/company-dashboard/company-dashboard.component';
import { CompanyReviewsManagementComponent } from './company/company-reviews-management/company-reviews-management.component';
import { CompanyProductsManagementComponent } from './company/company-products/products-management/company-products-management.component';
import { CompanySettingsManagementComponent } from './company/company-settings-management/company-settings-management.component';
import { CompanyTeamManagementComponent } from './company/company-team-management/company-team-management.component';
import { CategoryManagementComponent } from './admin/admin-category/category-management/category-management.component';
import { UsersManagementComponent } from './admin/admin-user/users-management/users-management.component';
import { EditProductComponent } from './admin/admin-product/edit-product/edit-product.component';
import { NewProductComponent } from './admin/admin-product/new-product/new-product.component';
import { ProductDetailsComponent } from './public/pages/product-details/product-details.component';
import { CompanyDetailsComponent } from './public/pages/company-details/company-details.component';
import { HomeComponent } from './public/pages/home/home.component';
import { MainComponent } from './public/layout/main/main.component';
import { LoginComponent } from './public/pages/auth/login/login.component';
import { RegisterComponent } from './public/pages/auth/register/register.component';
import { CompanyMainComponent } from './company/company-layout/company-main/company-main.component';
import {CompanyNewProductComponent} from './company/company-products/company-new-product/company-new-product.component';

export const routes: Routes = [

  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'product/:id', component: ProductDetailsComponent },
      { path: 'company/:id', component: CompanyDetailsComponent },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'admin',
    component: AdminMainComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'products', component: ProductsManagementComponent },
      { path: 'products/new', component: NewProductComponent },
      { path: 'products/:id', component: EditProductComponent },
      { path: 'companies', component: CompanyManagementComponent },
      { path: 'companies/:id', component: EditCompanyComponent },
      { path: 'categories', component: CategoryManagementComponent },
      { path: 'users', component: UsersManagementComponent },
    ],
  },
  {
    path: 'c',
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
  // {
  //   path: '**',
  //   redirectTo: '/'
  // },

];
