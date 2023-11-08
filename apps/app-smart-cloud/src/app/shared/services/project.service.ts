import {Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {HttpClient} from "@angular/common/http";
import {RegionModel} from "../models/region.model";
import {ProjectModel} from "../models/project.model";

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends BaseService {
  constructor(private http: HttpClient) {
    super();
  }


  getByRegion(regionId: number) {
    return this.http.get<ProjectModel[]>(this.baseUrl + `/projects?customerId=669&regionId=${regionId}`);
  }
}
