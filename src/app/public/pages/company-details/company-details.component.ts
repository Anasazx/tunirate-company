import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompanyService } from '../../../core/services/companyService/company.service';
import { ProductService } from '../../../core/services/productService/product.service';
import { SharedService } from '../../../core/services/sharedService/shared.service';


@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './company-details.component.html',
  styleUrl: './company-details.component.css'
})
export class CompanyDetailsComponent implements OnInit {

  company: any;
  products: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private productService: ProductService,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (!id) return;

      this.loadCompany(id);
      this.loadProducts(id);
    });

  }

  loadCompany(id: number) {
    this.companyService.getCompanyById(id)
      .subscribe(res => this.company = res);
  }

  loadProducts(id: number) {
    this.productService.getProductsByCompanyId(id)
      .subscribe(res => this.products = res);
  }
}