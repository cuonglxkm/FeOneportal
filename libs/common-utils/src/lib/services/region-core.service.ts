import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {RegionModel} from "../models/region.model";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class RegionCoreService extends BaseService {
  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
        'Content-Type': 'application/json',
        'user_root_id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
        'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
}
  getAll(baseUrl: string) {
    return this.http.get<RegionModel[]>(baseUrl+ this.ENDPOINT.provisions +  '/regions', {
      headers: this.getHeaders()
  });
  }
}
