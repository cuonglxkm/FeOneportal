import {Inject, Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ProjectModel} from "../models/project.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends BaseService {

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }
  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  getByRegion(regionId: number) {
    return this.http.get<ProjectModel[]>
    (this.apiGwUrl + this.ENDPOINT.provisions  + `/projects?regionId=${regionId}`, {
      headers: this.getHeaders()
    });
  }
}