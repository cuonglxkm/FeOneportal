import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { OfferDetail, Product } from '../models/catalog.model';

@Injectable({
  providedIn: 'root'
})

export class CatalogService extends BaseService {
  constructor(public http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  getCatalogOffer(productId: number, regionId: number, unitOfMeasure: string, unitOfMeasureProduct: string) {
    let param = new HttpParams()
    if(productId != undefined || productId != null) param = param.append('productId', productId)
    if(regionId != undefined || regionId != null) param = param.append('regionId', regionId)
    if(unitOfMeasure != undefined || unitOfMeasure != null) param = param.append('unitOfMeasure', unitOfMeasure)
    if(unitOfMeasureProduct != undefined || unitOfMeasureProduct != null) param = param.append('unitOfMeasureProduct', unitOfMeasureProduct)
    return this.http.get<OfferDetail[]>(this.baseUrl + this.ENDPOINT.catalogs + '/offers', {
      params: param
    })
  }

  getDetailOffer(id: number) {
    return this.http.get<OfferDetail>(this.baseUrl + this.ENDPOINT.catalogs + `/offers/${id}`)
  }

  searchProduct(uniqueName: string) {
    return this.http.get<Product[]>(this.baseUrl + this.ENDPOINT.catalogs + `/products?uniqueName=${uniqueName}&containsSearch=true`)
  }
}
