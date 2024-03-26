import {Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {HttpClient} from "@angular/common/http";
import {RegionModel} from "../models/region.model";

@Injectable({
  providedIn: 'root'
})
export class RegionService extends BaseService {
  constructor(private http: HttpClient) {
    super();
  }

  baseUrl: string = "https://api.onsmartcloud.com";

  getAll() {
    return this.http.get<RegionModel[]>(this.baseUrl + this.ENDPOINT.provisions +  '/regions');
  }
}
