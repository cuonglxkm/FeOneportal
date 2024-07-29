import { Inject, Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { WafDTO } from 'src/app/pages/waf/waf.model';

@Injectable({
  providedIn: 'root'
})
export class WafService extends BaseService {

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");
  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService,) {
    super(tokenService);
  }
  getWafs(pageSize: number, currentPage: number, status: string, name: string, wafPackage: string) {
    let param = new HttpParams()
    if(status != undefined || status != null) param = param.append('status', status)
    if(name != undefined || name != null) param = param.append('name', name)
    if(pageSize != undefined || pageSize != null) param = param.append('pageSize', pageSize)
    if(currentPage != undefined || currentPage != null) param = param.append('currentPage', currentPage)

    return this.http.get<BaseResponse<WafDTO[]>>(this.baseUrl + this.ENDPOINT.provisions + '/volumes', {
      params: param,
      headers: this.getHeaders().headers
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }


  getDetail(id: number): Observable<WafDTO> {
    // Tạo một đối tượng WafDTO giả để trả về
    const wafDetail: WafDTO = {
      id: id,
      name: 'Example Name',
      package: 'Example Package',
      begin: new Date('2024-01-01'),
      end: new Date('2024-12-31'),
      status: 'ACTIVE'
    };

    // Trả về một Observable chứa đối tượng WafDTO giả
    return of(wafDetail);
  }


}