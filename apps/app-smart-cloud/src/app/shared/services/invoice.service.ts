import {Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {InvoiceModel, InvoiceSearch} from "../models/invoice.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";

@Injectable({
    providedIn: 'root'
})

export class InvoiceService extends BaseService {
    constructor(private http: HttpClient) {
        super();
    }

    private getHeaders() {
        return new HttpHeaders({
            'Content-Type': 'application/json'
        })
    }

    search(formSearch: InvoiceSearch) {
        let params = new HttpParams()
        if(formSearch.customerId != undefined){
            params = params.append('customerId', formSearch.customerId)
        } else {
            params = params.append('customerId', '')
        }
        if(formSearch.invoiceCode != undefined){
            params = params.append('invoiceCode', formSearch.invoiceCode)
        } else {
            params = params.append('invoiceCode', '')
        }
        if(formSearch.pageSize !== null) {
            params = params.append('pageSize', formSearch.pageSize)
        } else {
            params = params.append('pageSize', 10)
        }
        if(formSearch.currentPage !== null) {
            params = params.append('currentPage', formSearch.currentPage)
        } else {
            params = params.append('currentPage', 1)
        }
        return this.http.get<BaseResponse<InvoiceModel[]>>(this.baseUrl + '/invoices', {
            headers: this.getHeaders(),
            params: params
        })
    }

    export(id: number) {
        return this.http.get(this.baseUrl + `/invoices/export/${id}`)
    }
}
