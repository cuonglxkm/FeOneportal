import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {PaymentModel, PaymentSearch} from "../models/payment.model";
import { Observable } from "rxjs";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { BaseResponse } from "../models/base-response";

@Injectable({
  providedIn: 'root'
})

export class PaymentService extends BaseService {
  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Project-Id': localStorage.getItem('projectId') && Number(localStorage.getItem('projectId')) > 0 ? Number(localStorage.getItem('projectId')) : 0,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  search(paymentSearch: PaymentSearch) {
    let params = new HttpParams()
    if (paymentSearch.code != undefined || paymentSearch.code != null) {
      params = params.append('code', paymentSearch.code)
    }
    if (paymentSearch.status != undefined || paymentSearch.status != null) {
      params = params.append('status', paymentSearch.status)
    }
    if (paymentSearch.fromDate != undefined || paymentSearch.fromDate != null) {
      params = params.append('fromdate', paymentSearch.fromDate)
    }
    if (paymentSearch.toDate != undefined || paymentSearch.toDate != null) {
      params = params.append('todate', paymentSearch.toDate)
    }
    if (paymentSearch.customerId != undefined || paymentSearch.customerId != null) {
      params = params.append('customerId', paymentSearch.customerId)
    }
    if (paymentSearch.pageSize != undefined || paymentSearch.pageSize != null) {
      params = params.append('pageSize', paymentSearch.pageSize)
    }
    if (paymentSearch.currentPage != undefined || paymentSearch.currentPage != null) {
      params = params.append('currentPage', paymentSearch.currentPage)
    }

    return this.http.get<BaseResponse<PaymentModel[]>>(this.baseUrl + this.ENDPOINT.payments + '/Paging', {
      headers: this.getHeaders(),
      params: params
    })
  }

  export(id: number) {
    return this.http.get(this.baseUrl + `/invoices/export/${id}`,
      {headers: this.getHeaders(), responseType: 'blob' as 'json'})
  }


  getPaymentById(id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.payments + `/${id}`);
  }

  getPaymentByPaymentNumber(paymentNumber: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.payments + `/PaymentByPaymentNumber/${paymentNumber}`);
  }
}
