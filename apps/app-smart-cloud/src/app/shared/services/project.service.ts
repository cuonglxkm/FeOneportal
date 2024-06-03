import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseService } from './base.service';
import { SizeInCloudProject } from '../models/project.model';
import { ProjectModel } from '../../../../../../libs/common-utils/src';

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends BaseService {

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

  getByRegion(regionId: number) {
    return this.http.get<ProjectModel[]>
    (this.baseUrl + this.ENDPOINT.provisions  + `/projects?regionId=${regionId}`, {
      headers: this.getHeaders()
    });
  }

  getByProjectId(id: number) {
    return this.http.get<SizeInCloudProject>
    (this.baseUrl + this.ENDPOINT.provisions  + `/projects/${id}`, {
      headers: this.getHeaders()
    });
  }

  getProjectVpc(id: number) {
    return this.http.get<SizeInCloudProject>(this.baseUrl + this.ENDPOINT.provisions + `/projects/${id}`, {
      headers: this.getHeaders()
    })
  }
  getCatelogOffer(unitOfMeasureProduct:string){
    
  }
}
