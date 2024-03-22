import { Component, Inject, Input, OnInit } from '@angular/core';
import {
  ALLOW_ANONYMOUS,
  DA_SERVICE_TOKEN,
  ITokenService,
  SocialService,
} from '@delon/auth';
import { Menu, MenuService, SettingsService } from '@delon/theme';
import { ActivatedRoute, Router } from '@angular/router';
import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '@env/environment';
import { UserModel } from '../../../../../../libs/common-utils/src/lib/shared-model';
import { of, switchMap, zip } from 'rxjs';
import { NotificationService } from '../../../../../../libs/common-utils/src/lib/notification-service';

export interface TokenResponse {
  [key: string]: NzSafeAny;

  /** Name for current user */
  id_token?: string;
  /** Avatar for current user */
  expires_in?: number;
  /** Email for current user */
  access_token?: string;
  refresh_token?: string;
}

@Component({
  selector: 'app-callback',
  template: ``,
  providers: [SocialService],
})
export class CallbackComponent implements OnInit {
  @Input() type = '';

  // @ts-ignore
  url = environment.sso.issuer;

  code: string = '';

  constructor(
    private socialService: SocialService,
    private settingsSrv: SettingsService,
    private router: Router,
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private menuService: MenuService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    console.log(this.router.url);
    // this.mockModel();
    this.code = this.activatedRoute.snapshot.queryParamMap.get('code') || '';
    this.getToken();
  }

  getToken() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(environment['sso'].clientId + ':'),
    });
    const helper = new JwtHelperService();
    const params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', this.code)
      .set('redirect_uri', environment['sso'].callback);

    let baseUrl = environment['baseUrl'];
    this.httpClient
      .post<TokenResponse>(this.url + '/connect/token', params.toString(), {
        headers,
        responseType: 'json',
        context: new HttpContext().set(ALLOW_ANONYMOUS, true),
      })
      .pipe(
        switchMap((token) => {
          const accessToken = token.access_token || '';
          const decodedToken = helper.decodeToken(accessToken);

          let info = {
            token: token.access_token,
            email: decodedToken['email'],
            time: token.expires_in,
            id_token: decodedToken['oi_au_id'],
            exp: decodedToken['exp'],
            refresh_token: token.refresh_token,
          };

          return this.httpClient
            .get<UserModel>(`${baseUrl}/users/` + info.email, {
              headers: new HttpHeaders({
                Authorization: 'Bearer ' + accessToken,
              }),
              context: new HttpContext().set(ALLOW_ANONYMOUS, true),
            })
            .pipe(
              switchMap((user) => {
                let additionInfo = {
                  name: user.name,
                  userId: user.id,
                };
                info = { ...info, ...additionInfo };
                return of(info);
              })
            );
        })
      )
      .subscribe(
        (response) => {
          this.settingsSrv.setUser({
            ...this.settingsSrv.user,
            ...response,
          });
          this.socialService.callback(response);
          this.notificationService.initiateSignalrConnection(true);
          this.httpClient
            .get(baseUrl + '/provisions/object-storage/userinfo')
            .subscribe((checkData) => {
              if (checkData) {
                let json = {
                  key: 'Object Storage',
                  text: 'Object Storage',
                  icon: 'anticon-profile',
                  children: [
                    {
                      text: 'Bucket',
                      link: '/app-smart-cloud/object-storage/bucket',
                    },
                    {
                      text: 'Sub User',
                      link: '/app-smart-cloud/object-storage/sub-user/list',
                    },
                    {
                      text: 'S3 Key',
                      link: '/app-smart-cloud/object',
                    },
                    {
                      text: 'Thống kê',
                      link: '/app-smart-cloud/object-storage/dashboard',
                    },
                  ],
                };
                this.menuService.setItem('Object Storage', json);
                this.menuService.resume();
              } else {
                let json = {
                  key: 'Object Storage',
                  text: 'Object Storage',
                  icon: 'anticon-profile',
                  link: '/app-smart-cloud/object-storage',
                };
                this.menuService.setItem('Object Storage', json);
              }
            });
        },
        (error) => {
          console.log(error);
          setTimeout(() => this.router.navigateByUrl(`/exception/500`));
        }
      );
  }
}
