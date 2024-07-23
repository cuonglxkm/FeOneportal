import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { SecurityGroupSearchCondition } from '../models/security-group';
import SecurityGroupRule, {
  FormDeleteRule,
  RuleSearchCondition,
  SecurityGroupRuleCreateForm
} from '../models/security-group-rule';
import { BaseService } from './base.service';
import { catchError, Observable, throwError } from 'rxjs';
import Pagination from '../models/pagination';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root'
})

export class SecurityGroupRuleService extends BaseService {

  constructor(public http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  create(form: SecurityGroupRuleCreateForm) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/security_group/rule', Object.assign(form), { headers: this.getHeaders().headers })
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

  delete(id: string, condition: SecurityGroupSearchCondition) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + '/security_group/rule', {
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

  deleteRule(formDeleteRule: FormDeleteRule) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + '/security_group/rule', {
      body: formDeleteRule,
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


  search(condition: RuleSearchCondition): Observable<Pagination<SecurityGroupRule>> {
    let params = new HttpParams();
    params = params.append('userId', condition.userId);
    params = params.append('projectId', condition.projectId);
    params = params.append('regionId', condition.regionId);
    params = params.append('pageSize', condition.pageSize);
    params = params.append('pageNumber', condition.pageNumber);
    params = params.append('securityGroupId', condition.securityGroupId);
    params = params.append('direction', condition.direction);

    return this.http.get<Pagination<SecurityGroupRule>>(this.baseUrl + this.ENDPOINT.provisions + '/security_group/rule/getpaging', {
      params: params,
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
}
