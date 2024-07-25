import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  ExecuteAttachOrDetach,
  FormCreateSG,
  FormDeleteSG,
  SecurityGroup,
  SecurityGroupCreateForm,
  SecurityGroupSearchCondition
} from '../models/security-group';
import { catchError, throwError } from 'rxjs';
import { BaseService } from 'src/app/shared/services/base.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root'
})
export class SecurityGroupService extends BaseService {

  constructor(public http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  search(condition: SecurityGroupSearchCondition) {
    let params = new HttpParams();
    params = params.append('userId', condition.userId);
    params = params.append('projectId', condition.projectId);
    params = params.append('regionId', condition.regionId);

    return this.http.get<SecurityGroup[]>(this.baseUrl + this.ENDPOINT.provisions + '/security_group/getall', {
      params: params,
      headers: this.getHeaders().headers
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }));
  }

  createSecurityGroup(form: FormCreateSG) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/security_group', Object.assign(form), {headers: this.getHeaders().headers})
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  create(form: SecurityGroupCreateForm, condition: SecurityGroupSearchCondition) {
    return this.http
      .post(this.baseUrl + this.ENDPOINT.provisions + '/security_group', Object.assign(form, condition), {headers: this.getHeaders().headers})
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  delete(id: string, condition: SecurityGroupSearchCondition) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + '/security_group', {
      body: JSON.stringify({ id, ...condition }),
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
      }));
  }


  deleteSG(form: FormDeleteSG) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + '/security_group', {
      body: form,
      headers: this.getHeaders().headers
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }));
  }

  attachOrDetach(form: ExecuteAttachOrDetach) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/security_group/action',
      Object.assign(form), {headers: this.getHeaders().headers})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('login');
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
        }));
  }

}
