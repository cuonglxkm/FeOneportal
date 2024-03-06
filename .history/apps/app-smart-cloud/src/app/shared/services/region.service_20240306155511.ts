import {Inject, Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {RegionModel} from "../models/region.model";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root'
})
export class RegionService extends BaseService {
  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
        'Content-Type': 'application/json',
        'user_root_id': this.tokenService.get()?.userId,
        'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
}
  getAll() {
    return this.http.get<RegionModel[]>(this.baseUrl + this.ENDPOINT.provisions +  '/regions');
  }
}
