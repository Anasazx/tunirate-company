import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent {

  menuItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: 'dashboard'
    },
    {
      label: 'Products',
      path: '/admin/products',
      icon: 'box'
    },
    {
      label: 'Categories',
      path: '/admin/categories',
      icon: 'grid'
    },
    {
      label: 'Companies',
      path: '/admin/companies',
      icon: 'building'
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: 'users'
    }
  ];

}