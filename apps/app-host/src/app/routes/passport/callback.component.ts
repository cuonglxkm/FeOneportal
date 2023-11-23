import {Component, Input, OnInit} from '@angular/core';
import {ALLOW_ANONYMOUS, SocialService} from '@delon/auth';
import {SettingsService} from '@delon/theme';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient, HttpContext, HttpHeaders, HttpParams} from "@angular/common/http";
import {NzSafeAny} from "ng-zorro-antd/core/types";
import {JwtHelperService} from "@auth0/angular-jwt";
import {environment} from "@env/environment";
import {UserModel} from "../../../../../../libs/common-utils/src/lib/shared-model";
import {of, switchMap} from "rxjs";


export interface TokenResponse {
  [key: string]: NzSafeAny;

  /** Name for current user */
  id_token?: string;
  /** Avatar for current user */
  expires_in?: number;
  /** Email for current user */
  access_token?: string;
}

@Component({
  selector: 'app-callback',
  template: ``,
  providers: [SocialService]
})
export class CallbackComponent implements OnInit {
  @Input() type = '';

  // @ts-ignore
  url = environment.sso.issuer

  code: string = '';

  constructor(
    private socialService: SocialService,
    private settingsSrv: SettingsService,
    private router: Router,
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    console.log(this.router.url)
    // this.mockModel();
    this.code = this.activatedRoute.snapshot.queryParamMap.get('code') || "";
    this.getToken();
  }


  getToken() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(environment['sso'].clientId + ':')
    });
    const helper = new JwtHelperService();
    const params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', this.code)
      .set('redirect_uri', environment['sso'].callback);

    let baseUrl = environment['baseUrl'];
    this.httpClient.post<TokenResponse>(this.url + '/connect/token', params.toString(),
      {
        headers,
        responseType: 'json',
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .pipe(
        switchMap(token => {
          let accessToken = token.access_token || '';
          const decodedToken = helper.decodeToken(accessToken);

          let info = {
            token: token.access_token,
            email: decodedToken['email'],
            time: token.expires_in,
            id_token: decodedToken['oi_au_id'],
          };

          return this.httpClient.get<UserModel>(`${baseUrl}/users/` + info.email, {
            // headers: new HttpHeaders({
            //   'Authorization': "Bearer " + accessToken
            // }),
            context: new HttpContext().set(ALLOW_ANONYMOUS, true)
          }).pipe(switchMap(user => {
            let additionInfo = {
              name: user.name,
              userId: user.id
            }
            info = {...info, ...additionInfo}
            return of(info)
          }))
        })
      )
      .subscribe((response) => {
        this.settingsSrv.setUser({
          ...this.settingsSrv.user,
          ...response
        });
        this.socialService.callback(response);

      }, error => {
        console.log(error)
        setTimeout(() => this.router.navigateByUrl(`/exception/500`));
      });
  }
}
