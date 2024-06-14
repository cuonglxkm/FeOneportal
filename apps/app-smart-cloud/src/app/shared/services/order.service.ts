import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable, of } from 'rxjs';
import { GetListSnapshotVlModel } from '../models/snapshotvl.model';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { OrderDTO, OrderDTOSonch } from '../models/order.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseService {
  private urlSnapshotVl = this.baseUrl + this.ENDPOINT.orders;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenService.get()?.token,
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
    }),
  };

  constructor(
    private http: HttpClient,
    private message: NzMessageService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    super();
  }

  getOrders(
    pageSize: number,
    pageNumber: number,
    orderCode: string,
    saleDept: string,
    saleDeptCode: string,
    seller: string,
    ticketCode: string,
    dSubscriptionNumber: string,
    dSubscriptionType: string,
    fromDate: Date,
    toDate: Date,
    status: number
  ): Observable<BaseResponse<OrderDTO[]>> {
    let urlResult = this.getConditionSearcOrders(
      pageSize,
      pageNumber,
      orderCode,
      saleDept,
      saleDeptCode,
      seller,
      ticketCode,
      dSubscriptionNumber,
      dSubscriptionType,
      fromDate,
      toDate,
      status
    );
    return this.http
      .get<BaseResponse<OrderDTO[]>>(urlResult, this.httpOptions)
      .pipe(
        catchError(
          this.handleError<BaseResponse<OrderDTO[]>>('get order-list error')
        )
      );
  }

  private getConditionSearcOrders(
    pageSize: number,
    pageNumber: number,
    orderCode: string,
    saleDept: string,
    saleDeptCode: string,
    seller: string,
    ticketCode: string,
    dSubscriptionNumber: string,
    dSubscriptionType: string,
    fromDate: Date,
    toDate: Date,
    status: number
  ): string {
    let urlResult = this.urlSnapshotVl;
    let count = 0;
    if (pageSize !== undefined && pageSize != null) {
      if (count == 0) {
        urlResult += '?pageSize=' + pageSize;
        count++;
      } else {
        urlResult += '&pageSize=' + pageSize;
      }
    }
    if (pageNumber !== undefined && pageNumber != null) {
      if (count == 0) {
        urlResult += '?pageNumber=' + pageNumber;
        count++;
      } else {
        urlResult += '&pageNumber=' + pageNumber;
      }
    }
    if (orderCode !== undefined && orderCode != null) {
      if (count == 0) {
        urlResult += '?orderCode=' + orderCode;
        count++;
      } else {
        urlResult += '&orderCode=' + orderCode;
      }
    }

    if (pageSize !== undefined && pageSize != null) {
      if (count == 0) {
        urlResult += '?pageSize=' + pageSize;
        count++;
      } else {
        urlResult += '&pageSize=' + pageSize;
      }
    }
    if (saleDept !== undefined && saleDept != null) {
      if (count == 0) {
        urlResult += '?saleDept=' + saleDept;
        count++;
      } else {
        urlResult += '&saleDept=' + saleDept;
      }
    }
    if (saleDeptCode !== undefined && saleDeptCode != null) {
      if (count == 0) {
        urlResult += '?saleDeptCode=' + saleDeptCode;
        count++;
      } else {
        urlResult += '&saleDeptCode=' + saleDeptCode;
      }
    }
    if (seller !== undefined && seller != null) {
      if (count == 0) {
        urlResult += '?seller=' + seller;
        count++;
      } else {
        urlResult += '&seller=' + seller;
      }
    }
    if (ticketCode !== undefined && ticketCode != null) {
      if (count == 0) {
        urlResult += '?ticketCode=' + ticketCode;
        count++;
      } else {
        urlResult += '&ticketCode=' + ticketCode;
      }
    }
    if (dSubscriptionNumber !== undefined && dSubscriptionNumber != null) {
      if (count == 0) {
        urlResult += '?dSubscriptionNumber=' + dSubscriptionNumber;
        count++;
      } else {
        urlResult += '&dSubscriptionNumber=' + dSubscriptionNumber;
      }
    }
    if (dSubscriptionType !== undefined && dSubscriptionType != null) {
      if (count == 0) {
        urlResult += '?dSubscriptionType=' + dSubscriptionType;
        count++;
      } else {
        urlResult += '&dSubscriptionType=' + dSubscriptionType;
      }
    }
    if (fromDate !== undefined && fromDate != null) {
      if (count == 0) {
        urlResult += '?fromDate=' + fromDate.toISOString();
        count++;
      } else {
        urlResult += '&fromDate=' + fromDate.toISOString();
      }
    }
    if (toDate !== undefined && toDate != null) {
      if (count == 0) {
        urlResult += '?toDate=' + toDate.toISOString();
        count++;
      } else {
        urlResult += '&toDate=' + toDate.toISOString();
      }
    }
    if (status !== undefined && status != null) {
      if (count == 0) {
        urlResult += '?status=' + status;
        count++;
      } else {
        urlResult += '&status=' + status;
      }
    }
    return urlResult;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      this.message.create('error', `Xảy ra lỗi: ${error}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  getDetail(id: any): Observable<OrderDTOSonch> {
    return this.http.get<OrderDTOSonch>(
      this.urlSnapshotVl + '/' + id,
      this.httpOptions
    );
  }

  getOrderBycode(code: any): Observable<any> {
    return this.http.get<OrderDTOSonch>(
      this.urlSnapshotVl + `/getbycode?code=${code}`,
      this.httpOptions
    );
  }

  createOrder(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.orders,
      data,
      this.httpOptions
    );
  }

  getTotalAmount(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.orders + '/totalamount',
      data
    );
  }

  validaterOrder(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.orders + '/validate',
      data
    );
  }
}
