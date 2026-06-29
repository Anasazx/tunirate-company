import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/productService/product.service';
import { ProductImageService } from '../../../core/services/productImageService/productImage.service';
import { SharedService } from '../../../core/services/sharedService/shared.service';
import { ProductResponse } from '../../../core/model/dto/productDTO/productResponse.model';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})




export class HomeComponent implements OnInit{

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    public imageService: ProductImageService,
    public sharedService: SharedService
  ){}

  products: ProductResponse[] = [];
  filteredProducts: ProductResponse[] = [];
  selectedCategory = 'All';
  selectedSubcategory = 'All';

ngOnInit(): void {
  this.productService.getProducts().subscribe({
    next: (products) => {
      this.products = products;
      this.route.queryParamMap.subscribe({
        next: (params) => {
          const category = params.get('category') || 'All';
          const subcategory = params.get('subcategory') || 'All';
          this.selectedCategory = category;
          this.selectedSubcategory = subcategory;
          this.filteredProducts = this.products.filter((product: any) => {
            const productCategory = product.categoryName ?? product.category;
            const productSubcategory = product.subcategoryName ?? product.subcategory ?? product.category;
            

            const matchesCategory = category === 'All' || productCategory === category;
            const matchesSubcategory = subcategory === 'All' || productSubcategory === subcategory;

            return matchesCategory && matchesSubcategory;
          });

            console.log("this r the filtred prod: ", this.filteredProducts);
            
        }
        
        
      });
    },

    error: (err) => {
      console.error(err);
    }
  });

}

  getSolidStars(rating: number): any[] {
    return Array(Math.floor(rating));
  }

  getOutlineStars(rating: number): any[] {
    return Array(5 - Math.floor(rating));
  }




}
