import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseService } from "./base.service";
import { FormCreateUserInvoice, FormUpdateUserInvoice } from "../models/invoice";
import { environment } from "@env/environment";

@Injectable({
  providedIn: 'root'
})

export class InvoiceService {
  ENDPOINT = {
    provisions: '/provisions',
    configurations: '/configurations',
    orders: '/orders',
    subscriptions: '/subscriptions',
    users: '/users',
    catalogs: '/catalogs',
    actionlogs: '/actionlogs',
    iam: '/iam',
    payments: '/payments'
  }
  public baseUrl: string;
  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService
  ) {
    this.baseUrl = environment.baseUrl;
    // super(tokenService);
  }

  createInvoice(formCreate: FormCreateUserInvoice) {
    return this.http.post(this.baseUrl + this.ENDPOINT.users + '/invoice',
        Object.assign(formCreate), {headers: this.getHeaders().headers})
  }

  updateInvoice(formUpdate: FormUpdateUserInvoice) {
    return this.http.put(this.baseUrl + this.ENDPOINT.users + '/invoice',
        Object.assign(formUpdate), {headers: this.getHeaders().headers})
  }

  protected getHeaders() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.tokenService.get()?.token,
        'User-Root-Id':
          localStorage.getItem('UserRootId') &&
          Number(localStorage.getItem('UserRootId')) > 0
            ? Number(localStorage.getItem('UserRootId'))
            : this.tokenService.get()?.userId,
        'Project-Id': localStorage.getItem('projectId') && Number(localStorage.getItem('projectId')) > 0 ? Number(localStorage.getItem('projectId')) : 0,
      }),
    };
  }

}
