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

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  getByRegion(regionId: number) {
    return this.http.get<ProjectModel[]>
    (this.baseUrl + this.ENDPOINT.provisions  + `/projects?regionId=${regionId}`, {
      headers: this.getHeaders().headers
    });
  }

  getByProjectId(id: number) {
    return this.http.get<SizeInCloudProject>
    (this.baseUrl + this.ENDPOINT.provisions  + `/projects/${id}`, {
      headers: this.getHeaders().headers
    });
  }

  getProjectVpc(id: number) {
    return this.http.get<SizeInCloudProject>(this.baseUrl + this.ENDPOINT.provisions + `/projects/${id}`, {
      headers: this.getHeaders().headers
    })
  }
  getCatelogOffer(unitOfMeasureProduct:string){
    
  }
}
