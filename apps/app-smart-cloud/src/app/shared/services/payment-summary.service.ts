import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root',
})
export class PaymentSummaryService extends BaseService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': localStorage?.getItem('UserRootId') && Number(localStorage?.getItem('UserRootId')) > 0 ? Number(localStorage?.getItem('UserRootId')) : this.tokenService?.get()?.userId,
      Authorization: 'Bearer ' + this.tokenService.get()?.token,
    }),
  };

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    super();
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
      this.httpOptions
    );
  }

  getDiscountByCode(promotionCode: string): Observable<any> {
    let url_ = `/discounts/${promotionCode}`;
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.catalogs + url_,
      this.httpOptions
    );
  }
}
