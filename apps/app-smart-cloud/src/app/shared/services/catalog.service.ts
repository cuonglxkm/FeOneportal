import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { OfferDetail, Product } from '../models/catalog.model';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CatalogService extends BaseService {

  constructor(public http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  getCatalogOffer(productId: number, regionId: number, unitOfMeasure: string, unitOfMeasureProduct: string) {
    let param = new HttpParams()
    if(productId != undefined || productId != null) param = param.append('productId', productId)
    if(regionId != undefined || regionId != null) param = param.append('regionId', regionId)
    if(unitOfMeasure != undefined || unitOfMeasure != null) param = param.append('unitOfMeasure', unitOfMeasure)
    if(unitOfMeasureProduct != undefined || unitOfMeasureProduct != null) param = param.append('unitOfMeasureProduct', unitOfMeasureProduct)
    return this.http.get<OfferDetail[]>(this.baseUrl + this.ENDPOINT.catalogs + '/offers', {
      params: param,
      headers: this.getHeaders().headers
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }));
  }

  getDetailOffer(id: number) {
    return this.http.get<OfferDetail>(this.baseUrl + this.ENDPOINT.catalogs + `/offers/${id}`, {
      headers: this.getHeaders().headers
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }));
  }

  searchProduct(uniqueName: string) {
    return this.http.get<Product[]>(this.baseUrl + this.ENDPOINT.catalogs + `/products?uniqueName=${uniqueName}&containsSearch=true`, {
      headers: this.getHeaders().headers
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }));
  }

  getActiveServiceByRegion(
    serviceArray: string[],
    regionid: number
  ): Observable<any> {
    let url_ =
      this.baseUrl + this.ENDPOINT.catalogs + '/products/activebyregion?';
    serviceArray.forEach((e) => (url_ = url_ + `catalogs=${e}&`));
    url_ = url_ + `regionid=${regionid}`;
    return this.http.get<any>(url_, this.getHeaders());
  }
}
