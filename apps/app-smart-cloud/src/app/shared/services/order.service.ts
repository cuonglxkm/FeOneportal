import {Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {Observable, of} from "rxjs";
import {GetListSnapshotVlModel} from "../models/snapshotvl.model";
import {catchError} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {NzMessageService} from "ng-zorro-antd/message";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {OrderDTO} from "../models/order.model";

@Injectable({
  providedIn: 'root'
})
export class OrderService extends BaseService {
  private urlSnapshotVl = this.baseUrl + this.ENDPOINT.orders;

  constructor(private http: HttpClient, private message: NzMessageService) {
    super();
  }

  getOrders(pageSize: number,
            pageNumber: number,
            orderCode: string,
            customerId: number,
            saleDept: string,
            saleDeptCode: string,
            seller: string,
            ticketCode: string,
            dSubscriptionNumber: string,
            dSubscriptionType: string,
            orderAfter: string,
            resultNote: string
  ): Observable<BaseResponse<OrderDTO[]>>{
    let urlResult = this.getConditionSearcOrders(pageSize, pageNumber, orderCode, customerId, saleDept, saleDeptCode, seller, ticketCode, dSubscriptionNumber, dSubscriptionType, orderAfter, resultNote);
    return this.http.get<BaseResponse<OrderDTO[]>>(urlResult).pipe(
      catchError(this.handleError<BaseResponse<OrderDTO[]>>('get order-list error'))
    );
  }

  private getConditionSearcOrders(pageSize: number,
                                  pageNumber: number,
                                  orderCode: string,
                                  customerId: number,
                                  saleDept: string,
                                  saleDeptCode: string,
                                  seller: string,
                                  ticketCode: string,
                                  dSubscriptionNumber: string,
                                  dSubscriptionType: string,
                                  orderAfter: string,
                                  resultNote: string): string {
    let urlResult = this.urlSnapshotVl;
    let count = 0;
    if (customerId !== undefined && customerId != null) {
      urlResult += '?customerId=' + customerId;
      count++;
    }
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
    if (orderAfter !== undefined && orderAfter != null) {
      if (count == 0) {
        urlResult += '?orderAfter=' + orderAfter;
        count++;
      } else {
        urlResult += '&orderAfter=' + orderAfter;
      }
    }
    if (resultNote !== undefined && resultNote != null) {
      if (count == 0) {
        urlResult += '?resultNote=' + resultNote;
        count++;
      } else {
        urlResult += '&resultNote=' + resultNote;
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
}
