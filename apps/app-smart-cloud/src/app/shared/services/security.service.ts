import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { BaseService } from "src/app/shared/services/base.service";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { Enable2FAResponseModel, FormEnable2FA } from "../models/security.model";
import { environment } from "@env/environment";

@Injectable({
    providedIn: 'root'
})
export class SecurityService extends BaseService {
    constructor(public http: HttpClient,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
        super();
    }

    authenticatorKey() {
      return this.http.get<any>(environment.issuer + "/account/mfa/authenticator-key")
        .pipe(catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('login');
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
      }))
    }

    enable2fa(form: FormEnable2FA) {
      console.log(form);
      return this.http.post<Enable2FAResponseModel>(environment.issuer + "/account/mfa/enable", Object.assign(form))
        .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
    }

    twoFactorProviders() {
      return this.http.get<any>(environment.issuer+ "/account/mfa/providers")
        .pipe(catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('login');
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
      }))
    }
}
