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
  private refreshToking = false;
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
  private refreshTokenRequest(): Observable<any> {
    const model = this.tokenSrv.get();
    const params = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', this.tokenSrv.get()?.['refresh_token']);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(environment['sso'].clientId + ':')
    });
    const result = this.httpClient.post<TokenResponse>(this.url + '/connect/token', params.toString(),
      {
        headers,
        responseType: 'json',
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      });
    return result;
    // return this.http.post(`/api/auth/refresh`, null, null, {headers: {refresh_token: model?.['refresh_token'] || ''}});
  }

  // #region 刷新Token方式一：使用 401 重新刷新 Token

  private tryRefreshToken(ev: any, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // 1、若请求为刷新Token请求，表示来自刷新Token可以直接跳转登录页
    if ([`/api/auth/refresh`].some(url => req.url.includes(url))) {
      this.toLogin();
      return throwError(() => ev);
    }
    // 2、如果 `refreshToking` 为 `true` 表示已经在请求刷新 Token 中，后续所有请求转入等待状态，直至结果返回后再重新发起请求
    if (this.refreshToking) {
      return this.refreshToken$.pipe(
        filter(v => !!v),
        take(1),
        switchMap((token) => next.handle(this.reAttachToken(req, token)))
      );
    }
    // 3、尝试调用刷新 Token
    this.refreshToking = true;
    this.refreshToken$.next(null);
    const helper = new JwtHelperService();
    let result: any;
    const rs = this.refreshTokenRequest()
      .subscribe(
        data => {
        const accessToken = data.access_token || '';
        const decodedToken = helper.decodeToken(accessToken);
        this.refreshToking = false;
        this.refreshToken$.next(data.access_token);
        result = {
          token: data.access_token,
          email: decodedToken['email'],
          time: data.expires_in,
          id_token: decodedToken['oi_au_id'],
          exp: decodedToken['exp'],
          refresh_token: data.refresh_token,
        };
        this.tokenSrv.set(result);
        this.settingsSrv.setUser({
          ...this.settingsSrv.user,
          ...result
        });
        return next.handle(this.reAttachToken(req, data.access_token));
      },
        error => {
          this.refreshToking = false;
          this.tokenSrv.clear();
          this.toLogin();
          return throwError(() => error);
        })
    //   .pipe(
    //   switchMap(res => {
    //     const accessToken = res.access_token || '';
    //     const decodedToken = helper.decodeToken(accessToken);
    //     // 通知后续请求继续执行
    //     this.refreshToking = false;
    //     this.refreshToken$.next(res.refresh_token);
    //     // 重新保存新 token
    //     // this.tokenSrv.set(res);
    //
    //     const info = {
    //
    //     };
    //     this.tokenSrv.set(info);
    //     // 重新发起请求
    //     return next.handle(this.reAttachToken(req));
    //   }),
    //   catchError(err => {
    //     this.refreshToking = false;
    //     this.toLogin();
    //     return throwError(() => err);
    //   })
    // );
    return this.refreshToken$.pipe(
      filter(v => !!v),
      take(1),
      switchMap((token) => next.handle(this.reAttachToken(req, token)))
    );
  }

  /**
   * Đính kèm lại thông tin Token mới
   *
   * > Vì yêu cầu đã được bắt đầu nên nó sẽ không được thực hiện lại `@delon/auth` nên cần phải đính kèm lại Mã thông báo mới tùy theo tình hình kinh doanh.
   */
  private reAttachToken(req: HttpRequest<any>, token: any): HttpRequest<any> {
    // 以下示例是以 NG-ALAIN 默认使用 `SimpleInterceptor`
    // const token = this.tokenSrv.get()?.token;
    return req.clone({
      setHeaders: {
        token: `Bearer ${token}`
      }
    });
  }

  // #endregion

  // #region  Phương thức làm mới mã thông báo thứ hai: sử dụng giao diện `refresh` của `@delon/auth`

  private buildAuthRefresh(): void {
    if (!this.refreshTokenEnabled) {
      return;
    }
    this.tokenSrv.refresh
      .pipe(
        filter(() => !this.refreshToking),
        switchMap(res => {
          this.refreshToking = true;
          return this.refreshTokenRequest();
        })
      )
      .subscribe({
        next: res => {
          // TODO: Mock expired value
          res.expired = +new Date() + 1000 * 60 * 5;
          this.refreshToking = false;
          this.tokenSrv.set(res);
        },
        error: () => this.toLogin()
      });
  }

  // #endregion

  private toLogin(): void {
    // this.notification.error(`Hết phiên đăng nhập`, ``);
    this.goTo(this.tokenSrv.login_url!);

  }

  private handleData(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    this.checkStatus(ev);
    // 业务处理：一些通用操作
    switch (ev.status) {
      case 200:
        // 业务层级错误处理，以下是假定restful有一套统一输出格式（指不管成功与否都有相应的数据格式）情况下进行处理
        // 例如响应内容：
        //  错误内容：{ status: 1, msg: '非法参数' }
        //  正确内容：{ status: 0, response: {  } }
        // 则以下代码片断可直接适用
        // if (ev instanceof HttpResponse) {
        //   const body = ev.body;
        //   if (body && body.status !== 0) {
        //     const customError = req.context.get(CUSTOM_ERROR);
        //     if (customError) this.injector.get(NzMessageService).error(body.msg);
        //     // 注意：这里如果继续抛出错误会被行258的 catchError 二次拦截，导致外部实现的 Pipe、subscribe 操作被中断，例如：this.http.get('/').subscribe() 不会触发
        //     // 如果你希望外部实现，需要手动移除行259
        //     return if (customError) throwError({}) : of({});
        //   } else {
        //     // 返回原始返回体
        //     if (req.context.get(RAW_BODY) || ev.body instanceof Blob) {
        //        return of(ev);
        //     }
        //     // 重新修改 `body` 内容为 `response` 内容，对于绝大多数场景已经无须再关心业务状态码
        //     return of(new HttpResponse(Object.assign(ev, { body: body.response })));
        //     // 或者依然保持完整的格式
        //     return of(ev);
        //   }
        // }
        break;
      case 401:
        // if (this.refreshTokenEnabled && this.refreshTokenType === 're-request') {
        //   this.tryRefreshToken(ev, req, next);
        // }
        this.toLogin();
        break;
      case 403:
      case 404:
      case 500:
        // this.goTo(`/exception/${ev.status}?url=${req.urlWithParams}`);
        break;
      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn(
            'Lỗi không xác định, chủ yếu là do phần phụ trợ không hỗ trợ CORS tên miền chéo hoặc cấu hình không hợp lệ, vui lòng tham khảo https://ng-alain.com/docs/server để giải quyết các vấn đề về tên miền chéo', ev
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

    if (this.checkTokenExpired()) {
      this.tryRefreshToken(null, req, next);
    }

    const newReq = req.clone({url, setHeaders: this.getAdditionalHeaders(req.headers)});
    return next.handle(newReq).pipe(
      mergeMap(ev => {
        if (ev instanceof HttpResponseBase) {
           return this.handleError(ev, newReq, next);
           // test case
          //return this.tryRefreshToken(null, req, next);
        }
        return of(ev);
      }),
      // catchError((err: HttpErrorResponse) => this.handleError(err, newReq, next))
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

}
