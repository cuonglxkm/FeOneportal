import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseService } from './base.service';
import { RegionModel } from '../../../../../../libs/common-utils/src';

@Injectable({
  providedIn: 'root'
})
export class RegionService extends BaseService{
  private _previousRegionId: number;
  private _isInit: boolean = false;
  private _isFirstLoad: boolean = true;

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  get previousRegionId(): number {
    return this._previousRegionId;
  }

  set previousRegionId(value: number) {
    this._previousRegionId = value;
  }

  get isInit(): boolean {
    return this._isInit;
  }

  set isInit(value: boolean) {
    this._isInit = value;
  }

  get isFirstLoad(): boolean {
    return this._isFirstLoad;
  }

  set isFirstLoad(value: boolean) {
    this._isFirstLoad = value;
  }

  getListRegions() {
    return this.http.get<RegionModel[]>(this.baseUrl + this.ENDPOINT.provisions + '/regions', {
      headers: this.getHeaders().headers
    });
  }
}
