import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root',
})
export class PaymentSummaryService extends BaseService {

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService
  ) {
    super(tokenService);
  }

  getDiscounts(
    promotionCode: string,
    pageSize: number,
    currentPage: number
  ): Observable<any> {
    if (promotionCode == undefined) promotionCode = '';
    let url_ = `/discounts?promotionCode=${promotionCode}&pageSize=${pageSize}&currentPage=${currentPage}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.catalogs + url_,
      this.getHeaders()
    );
  }

  getDiscountByCode(promotionCode: string): Observable<any> {
    let url_ = `/discounts/${promotionCode}`;
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.catalogs + url_,
      this.getHeaders()
    );
  }
}
