import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import Image from "../models/image";

@Injectable({
  providedIn: 'root'
})

export class ImageService extends BaseService {
  constructor(public http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  search(regionId: number) {
    return this.http.get<Image[]>
    (this.baseUrl + this.ENDPOINT.provisions + `/images?customerId=${this.tokenService.get()?.userId}&region=${regionId}`);
  }


}
