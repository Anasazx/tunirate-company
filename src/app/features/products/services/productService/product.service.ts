import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { Observable } from 'rxjs';
import { ProductResponse } from '../../models/productDTO/productResponse.model';
import {CompanyProductRequest} from '../../models/productDTO/companyProductRequest.model';



@Injectable({
  providedIn: 'root'
})



export class ProductService {

  productUrl : String;

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.productUrl = this.sharedService.publicUrl + "/product"
  }

  getProductById(productId: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.productUrl.toString()}/c/${productId}`);
  }

  //Company method
  createProduct(payload: CompanyProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.productUrl.toString(), payload);
  }

  //Company method
  getMyCompanyProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(
      `${this.productUrl.toString()}/my`
    );
  }



}
