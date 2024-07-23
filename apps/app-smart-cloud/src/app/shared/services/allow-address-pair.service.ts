import {BaseService} from "../../shared/services/base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Inject, Injectable} from "@angular/core";
import {catchError, Observable} from "rxjs";
import PairInfo, {
  AllowAddressPairCreateOrDeleteForm,
  AllowAddressPairSearchForm
} from "../../shared/models/allow-address-pair";
import Pagination from "../models/pagination";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Injectable({
  providedIn: 'root'
})
export class AllowAddressPairService extends BaseService {

  constructor(public http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  search(form: AllowAddressPairSearchForm): Observable<Pagination<PairInfo>> {
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

    return this.http.get<Pagination<PairInfo>>(this.baseUrl + this.ENDPOINT.provisions + '/instances/allow_adress_pair', {
      params: params
    })
      .pipe(catchError(this.errorCode));
  }

  createOrDelete(form: AllowAddressPairCreateOrDeleteForm) {
    return this.http.post(this.baseUrl +
      this.ENDPOINT.provisions + '/instances/allowadresspair', Object.assign(form)).pipe(catchError(this.errorCode));
  }


}
