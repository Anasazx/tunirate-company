import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ProductService } from '../../services/productService/product.service';
import { SharedService } from '../../../../core/services/sharedService/shared.service';

import { DetailedProduct } from '../../models/detailedProduct.model';
import {ProductResponse} from '../../models/productDTO/productResponse.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {

  product?: ProductResponse;

  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.loadProduct();
  }

  private loadProduct(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'Invalid product id.';
      return;
    }

    this.loading = true;

    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load product.';
        this.loading = false;
      }
    });

  }

}
