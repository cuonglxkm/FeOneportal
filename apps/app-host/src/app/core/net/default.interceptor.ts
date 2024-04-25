import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor, HttpParams,
  HttpRequest,
  HttpResponseBase
} from '@angular/common/http';
import {Injectable, Injector} from '@angular/core';
import {Router} from '@angular/router';
import {ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService, SocialService} from '@delon/auth';
import {ALAIN_I18N_TOKEN, IGNORE_BASE_URL, _HttpClient, CUSTOM_ERROR, RAW_BODY, SettingsService} from '@delon/theme';
import {environment} from '@env/environment';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {BehaviorSubject, Observable, of, throwError, catchError, filter, mergeMap, switchMap, take} from 'rxjs';
import {CallbackComponent, TokenResponse} from "../../routes/passport/callback.component";
import {JwtHelperService} from "@auth0/angular-jwt";
import {UserModel} from "../../../../../../libs/common-utils/src";

const CODEMESSAGE: { [key: number]: string } = {
  200: 'Máy chủ trả về thành công dữ liệu được yêu cầu. ',
  201: 'Tạo hoặc sửa đổi dữ liệu thành công. ',
  202: 'Một yêu cầu đã được đưa vào hàng đợi nền (tác vụ không đồng bộ). ',
  204: 'Xóa dữ liệu thành công. ',
  400: 'Đã xảy ra lỗi trong yêu cầu được đưa ra và máy chủ không tạo hoặc sửa đổi dữ liệu. ',
  401: 'Người dùng không có quyền (mã thông báo, tên người dùng, mật khẩu không chính xác). ',
  403: 'Người dùng được ủy quyền nhưng quyền truy cập bị cấm. ',
  404: 'Yêu cầu được thực hiện đối với bản ghi không tồn tại và máy chủ không thực hiện thao tác. ',
  406: 'Định dạng được yêu cầu không có sẵn. ',
  410: 'Tài nguyên được yêu cầu đã bị xóa vĩnh viễn và sẽ không còn khả dụng nữa. ',
  422: 'Đã xảy ra lỗi xác thực khi tạo đối tượng. ',
  500: 'Đã xảy ra lỗi máy chủ, vui lòng kiểm tra máy chủ. ',
  502: 'Lỗi cổng. ',
  503: 'Dịch vụ không khả dụng. Máy chủ tạm thời bị quá tải hoặc đang bảo trì. ',
  504: 'Đã hết thời gian chờ cổng. '
};

/**
 * 默认HTTP拦截器，其注册细节见 `app.module.ts`
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  private refreshTokenEnabled = environment.api.refreshTokenEnabled;
  private refreshTokenType: 're-request' | 'auth-refresh' = environment.api.refreshTokenType;
  private isRefreshing = false;
  private refreshToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
// @ts-ignore
  url = environment.sso.issuer
  constructor(private injector: Injector,private httpClient: HttpClient,private settingsSrv: SettingsService,) {
    if (this.refreshTokenType === 'auth-refresh') {
      // this.buildAuthRefresh();
    }
  }

  private get notification(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  private get tokenSrv(): ITokenService {
    return this.injector.get(DA_SERVICE_TOKEN);
  }

  private get http(): _HttpClient {
    return this.injector.get(_HttpClient);
  }

  private goTo(url: string): void {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url), 1000);
  }

  private checkStatus(ev: HttpResponseBase): void {
    if ((ev.status >= 200 && ev.status < 300) || ev.status === 401) {
      return;
    }

    const errortext = CODEMESSAGE[ev.status] || ev.statusText;
    this.notification.error(`请求错误 ${ev.status}: ${ev.url}`, errortext);
  }

  /**
   * 刷新 Token 请求
   */
  private refreshTokenRequest() {
    const params = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', this.tokenSrv.get()?.['refresh_token']);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(environment['sso'].clientId + ':')
    });
    localStorage.removeItem('PermissionOPA');
    const result = this.httpClient.post<TokenResponse>(this.url + '/connect/token', params.toString(),
      {
        headers,
        responseType: 'json',
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      });
    return result;
  }

  //
  // private tryRefreshToken(ev: any, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
  //
  //   // if ([`/api/auth/refresh`].some(url => req.url.includes(url))) {
  //   //   this.toLogin();
  //   //   return throwError(() => ev);
  //   // }
  //
  //   if (this.refreshToking) {
  //     return this.refreshToken$.pipe(
  //       filter(v => !!v),
  //       take(1),
  //       switchMap((token) => next.handle(this.reAttachToken(req, token)))
  //     );
  //   }
  //   // 3、尝试调用刷新 Token
  //   this.refreshToking = true;
  //   this.refreshToken$.next(null);
  //   const helper = new JwtHelperService();
  //   let result: any;
  //   const rs = this.refreshTokenRequest()
  //     .subscribe(
  //       data => {
  //       const accessToken = data.access_token || '';
  //       const decodedToken = helper.decodeToken(accessToken);
  //       this.refreshToking = false;
  //       this.refreshToken$.next(data.access_token);
  //       result = {
  //         token: data.access_token,
  //         email: decodedToken['email'],
  //         time: data.expires_in,
  //         id_token: decodedToken['oi_au_id'],
  //         exp: decodedToken['exp'],
  //         refresh_token: data.refresh_token,
  //       };
  //       this.tokenSrv.set(result);
  //       this.settingsSrv.setUser({
  //         ...this.settingsSrv.user,
  //         ...result
  //       });
  //       return next.handle(this.reAttachToken(req, data.access_token));
  //     },
  //       error => {
  //         this.refreshToking = false;
  //         this.tokenSrv.clear();
  //         this.toLogin();
  //         return throwError(() => error);
  //       })
  //   return this.refreshToken$.pipe(
  //     filter(v => !!v),
  //     take(1),
  //     switchMap((token) => next.handle(this.reAttachToken(req, token)))
  //   );
  // }

  /**
   * Đính kèm lại thông tin Token mới
   *
   * > Vì yêu cầu đã được bắt đầu nên nó sẽ không được thực hiện lại `@delon/auth` nên cần phải đính kèm lại Mã thông báo mới tùy theo tình hình kinh doanh.
   */
  private reAttachToken(req: HttpRequest<any>, token: any): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // #endregion

  // #region  Phương thức làm mới mã thông báo thứ hai: sử dụng giao diện `refresh` của `@delon/auth`

  // private buildAuthRefresh(): void {
  //   if (!this.refreshTokenEnabled) {
  //     return;
  //   }
  //   this.tokenSrv.refresh
  //     .pipe(
  //       filter(() => !this.isRefreshing),
  //       switchMap(res => {
  //         this.isRefreshing = true;
  //         return this.refreshTokenRequest();
  //       })
  //     )
  //     .subscribe({
  //       next: res => {
  //         // TODO: Mock expired value
  //         res.expired = +new Date() + 1000 * 60 * 5;
  //         this.isRefreshing = false;
  //         this.tokenSrv.set(res);
  //       },
  //       error: () => this.toLogin()
  //     });
  // }

  // #endregion

  private toLogin(): void {
    // this.notification.error(`Hết phiên đăng nhập`, ``);
    this.goTo(this.tokenSrv.login_url!);

  }

  private getAdditionalHeaders(headers?: HttpHeaders): { [name: string]: string } {
    const res: { [name: string]: string } = {};
    const lang = this.injector.get(ALAIN_I18N_TOKEN).currentLang;
    if (!headers?.has('Accept-Language') && lang) {
      res['Accept-Language'] = lang;
    }
    return res;
  }

  private handleError(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    switch (ev.status) {
      case 200:
        break;
      case 401:
        // this.tryRefreshToken(null, req, next);
        // this.tokenSrv.clear()
        // if (this.refreshTokenEnabled && this.refreshTokenType === 're-request') {
        //   this.tryRefreshToken(req, next);
        // }
        // this.toLogin();
        break;
      case 403:
      case 404:
      case 500:
        // this.goTo(`/exception/${ev.status}?url=${req.urlWithParams}`);

      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn(
            'Lỗi không xác định!', ev
          );
        }
        break;
    }
    if (ev instanceof HttpErrorResponse) {
      return throwError(() => ev);
    } else {
      return of(ev);
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let url = req.url;
    if (!req.context.get(IGNORE_BASE_URL) && !url.startsWith('https://') && !url.startsWith('http://')) {
      const {baseUrl} = environment.api;
      url = baseUrl + (baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url);
    }

    // if (this.checkTokenExpired()) {
    //   this.tryRefreshToken(null, req, next);
    // }

    const newReq = req.clone({url, setHeaders: this.getAdditionalHeaders(req.headers)});
    return next.handle(newReq).pipe(
      catchError(err => {
        if (err instanceof HttpResponseBase && err.status === 401) {
          console.log("---Bắt lỗi 401---")
           return this.handle401Error(newReq, next);
        } else {
          console.log("---Bắt lỗi nhưng không phải 401---")
        }
        return throwError(err);
      }),
    );

  }

  checkTokenExpired() {
    // @ts-ignore
    let exp = this.tokenSrv.get()?.exp;
    if (exp == null) return false;

    const expirationTime = exp * 1000;
    const currentTime = Date.now();
    return currentTime > expirationTime;
  }


  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshToken$.next(null);

      const token = this.tokenSrv.get()?.['refresh_token'];
      if (token) {
        return this.refreshTokenRequest().pipe(
          switchMap((token: any) => {
            this.isRefreshing = false;

            const helper = new JwtHelperService();
            this.refreshToken$.next(token.access_token);

            const accessToken = token.access_token || '';
            const decodedToken = helper.decodeToken(accessToken);
            let addition = {
              token: token.access_token,
              time: token.expires_in,
              exp: decodedToken['exp'],
              refresh_token: token.refresh_token,
            };
            let result =
              this.tokenSrv.get();
            this.tokenSrv.set({
              ...result,
              ...addition
            });
            this.settingsSrv.setUser({
              ...this.settingsSrv.user,
              ...result
            });
            return next.handle(this.reAttachToken(request, token.access_token));
          }),
          catchError((err) => {
            // this.notification.error('Thất bại', 'Tái tạo token thất bại');
            this.isRefreshing = false;
            this.tokenSrv.clear()
            return throwError(err);
          })
        );
      } else {
        this.tokenSrv.clear()
        this.toLogin();
      }

    } else {
    }

    return this.refreshToken$.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next.handle(this.reAttachToken(request, token)))
    );
  }

}
