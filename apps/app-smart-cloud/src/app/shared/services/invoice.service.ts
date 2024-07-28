import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormCreateUserInvoice, FormUpdateUserInvoice } from "../models/invoice";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: 'root'
})

export class InvoiceService extends BaseService {
  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) tokenService: ITokenService
  ) {
    super(tokenService);
  }

  createInvoice(formCreate: FormCreateUserInvoice) {
    return this.http.post(this.baseUrl + this.ENDPOINT.users + '/invoice',
        Object.assign(formCreate), {headers: this.getHeaders().headers})
  }

  updateInvoice(formUpdate: FormUpdateUserInvoice) {
    return this.http.put(this.baseUrl + this.ENDPOINT.users + '/invoice',
        Object.assign(formUpdate), {headers: this.getHeaders().headers})
  }
}
