import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {PaymentModel, PaymentSearch} from "../models/payment.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import { Observable, throwError } from 'rxjs';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root'
})

export class PaymentService extends BaseService {
  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
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
    if (paymentSearch.invoiceStatus != undefined || paymentSearch.invoiceStatus != null) {
      params = params.append('invoiceStatus', paymentSearch.invoiceStatus)
    }

    return this.http.get<BaseResponse<PaymentModel[]>>(this.baseUrl + this.ENDPOINT.payments + '/Paging', {
      params: params }).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  export(id: number) {
    return this.http.get(this.baseUrl + `/invoices/export/${id}`,
      {responseType: 'blob' as 'json'}).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  exportInvoice(id: number) {
    return this.http.get(this.baseUrl + `/invoices/export-einvoice/${id}`, { responseType: 'text' }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }


  getPaymentById(id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.payments + `/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  getPaymentByPaymentNumber(paymentNumber: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.payments
      + `/PaymentByPaymentNumber/${paymentNumber}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  cancelPayment(paymentNumber: string): Observable<any> {
    return this.http.put<any>(
      this.baseUrl + this.ENDPOINT.payments + `/cancel?paymentNumber=${paymentNumber}`, this.getHeaders()
    );
  }
}
