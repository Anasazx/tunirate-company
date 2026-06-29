import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductResponse } from '../../../models/productDTO/productResponse.model';
import { ProductService } from '../../../../../core/services/productService/product.service';
import { SharedService } from '../../../../../core/services/sharedService/shared.service';


@Component({
  selector: 'app-company-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-products-management.component.html',
  styleUrl: './company-products-management.component.css'
})
export class CompanyProductsManagementComponent implements OnInit {

  loading = false;
  error: string | null = null;

  products: ProductResponse[] = [];

  constructor(
    private router: Router,
    private productService: ProductService,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;

    this.productService.getMyCompanyProducts().subscribe({

      next: (products) => {
        this.products = products;
        this.loading = false;
      },

      error: () => {
        this.loading = false;
        this.error = 'Failed to load products';
      }

    });
  }

  addProduct() {
    this.router.navigate(['/c/products/new']);
  }

  editProduct(id: number) {
    this.router.navigate(['/c/products', id]);
  }

}
