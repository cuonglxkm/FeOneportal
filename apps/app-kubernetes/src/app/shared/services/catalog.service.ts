import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Injectable({
  providedIn: 'root'
})

export class CatalogService extends BaseService {
  constructor(public http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  getCatalogOffer(productId: number, regionId: number, unitOfMeasure: string) {
    let param = new HttpParams()
    if(productId != undefined || productId != null) param = param.append('productId', productId)
    if(regionId != undefined || regionId != null) param = param.append('regionId', regionId)
    if(unitOfMeasure != undefined || unitOfMeasure != null) param = param.append('unitOfMeasure', unitOfMeasure)
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.catalogs + '/offers', {
      headers: this.getHeaders(),
      params: param
    })
  }
}
