import {BaseService} from "../../shared/services/base.service";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {catchError, Observable, throwError} from "rxjs";
import PairInfo, {AllowAddressPairCreateOrDeleteForm, AllowAddressPairSearchForm}
    from "../../shared/models/allow-address-pair";

@Injectable({
    providedIn: 'root'
})
export class AllowAddressPairService extends BaseService {

    constructor(public http: HttpClient) {
        super();
    }

    private getHeaders() {
        return new HttpHeaders({
            'Content-Type': 'application/json'
        })
    }

    search(form: AllowAddressPairSearchForm): Observable<PairInfo[]> {
        let params = new HttpParams();
        params = params.append('customerId', form.customerId);
        params = params.append('region', form.region);
        params = params.append('portId', form.portId);
        params = params.append('vpcId', form.vpcId);
        if (form.search != null) {
            params = params.append('search', form.search);
        }
        params = params.append('pageSize', form.pageSize);
        params = params.append('currentPage', form.currentPage);

        return this.http.get<PairInfo[]>(this.baseUrl + this.ENDPOINT.provisions + '/instances/allow_adress_pair', {
            headers: this.getHeaders(),
            params: params
        })
            .pipe(catchError(this.errorCode));
    }

    createOrDelete(form: AllowAddressPairCreateOrDeleteForm) {
        return this.http.post(this.baseUrl + this.ENDPOINT.provisions  + '/instances/allowadresspair', Object.assign(form))
            .pipe(catchError(this.errorCode));
    }




}
