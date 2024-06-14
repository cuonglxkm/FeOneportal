import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { BaseService } from "./base.service";
import { FormCreateUserInvoice, FormUpdateUserInvoice } from "../models/invoice";

@Injectable({
  providedIn: 'root'
})

export class InvoiceService extends BaseService {

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  createInvoice(formCreate: FormCreateUserInvoice) {
    return this.http.post(this.baseUrl + this.ENDPOINT.users + '/invoice',
        Object.assign(formCreate), {headers: this.getHeaders()})
  }

  updateInvoice(formUpdate: FormUpdateUserInvoice) {
    return this.http.put(this.baseUrl + this.ENDPOINT.users + '/invoice',
        Object.assign(formUpdate), {headers: this.getHeaders()})
  }


}
