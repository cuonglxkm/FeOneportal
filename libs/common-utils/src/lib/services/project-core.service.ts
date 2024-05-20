import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseService } from './base.service';
import { ProjectModel } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectCoreService extends BaseService {

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }
  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  getByRegion(baseUrl: string, regionId: number) {
    return this.http.get<ProjectModel[]>
    (baseUrl + this.ENDPOINT.provisions  + `/projects?regionId=${regionId}`, {
      headers: this.getHeaders()
    });
  }
}
