import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import {
  HttpClient,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionID } from '../enums/common.enum';


@Injectable({
  providedIn: 'root',
})
export class CommonService extends BaseService {
  region = JSON.parse(localStorage.getItem('regionId'));

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService
  ) {
    super(tokenService);
  }

  navigateAdvance(route: string, advanceRoute: string){
    if(this.region === RegionID.ADVANCE){
        this.router.navigate([advanceRoute])
    }else{
        this.router.navigate([route])
    }
  }

  navigateAdvanceWithId(route: string, advanceRoute: string, id: string | number){
    if(this.region === RegionID.ADVANCE){
        this.router.navigate([advanceRoute, id])
    }else{
        this.router.navigate([route, id])
    }
  }
}
