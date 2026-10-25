import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';
import { authGuard, guestGuard, headGuard } from './core/guards/auth.guard';

const title = (page: string) => `${page} · ReviewHood for Business`;

// Pages are lazy loaded so the first screen loads fast
export const routes: Routes = [
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    title: title('Sign in'),
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', title: title('Dashboard'), loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'products', title: title('Products'), loadComponent: () => import('./features/products/products-list.component').then(m => m.ProductsListComponent) },
      { path: 'products/new', title: title('New product'), loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'products/:id/edit', title: title('Edit product'), loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'products/:id', title: title('Product'), loadComponent: () => import('./features/products/product-details.component').then(m => m.ProductDetailsComponent) },
      { path: 'reviews', title: title('Reviews'), loadComponent: () => import('./features/reviews/reviews.component').then(m => m.ReviewsComponent) },
      { path: 'team', canActivate: [headGuard], title: title('Team'), loadComponent: () => import('./features/team/team.component').then(m => m.TeamComponent) },
      { path: 'profile', canActivate: [headGuard], title: title('Company profile'), loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },

      // Old URLs, kept so existing links still work
      { path: 'products/edit/:id', redirectTo: 'products/:id/edit' },
      { path: 'settings', redirectTo: 'profile' },
    ],
  },
  { path: '**', redirectTo: '' },
];
