import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { BaseService } from "../shared/services/base.service";
import { OrderPayment } from "../model/cluster.model";

@Injectable({
  providedIn: 'root',
})

export class CostService extends BaseService {

  constructor(private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  baseUrl: string = "https://api.onsmartcloud.com";

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  getTotalAmount(data: OrderPayment) {
    return this.http.post(`${this.baseUrl}/orders/totalamount`, data, { headers: this.getHeaders() });
  }

}
