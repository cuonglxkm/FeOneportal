import {Component, Input, OnInit} from '@angular/core';
import {ALLOW_ANONYMOUS, SocialService} from '@delon/auth';
import {SettingsService} from '@delon/theme';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient, HttpContext, HttpHeaders, HttpParams} from "@angular/common/http";
import {NzSafeAny} from "ng-zorro-antd/core/types";
import {JwtHelperService} from "@auth0/angular-jwt";


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

  url = 'https://172.16.68.200:1000/connect/token';

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

  private mockModel(): void {
    const info = {
      token: '123456789',
      name: 'cipchk',
      email: `${this.type}@${this.type}.com`,
      id: 10000,
      time: +new Date()
    };
    this.settingsSrv.setUser({
      ...this.settingsSrv.user,
      ...info
    });
    // this.socialService.callback(info);

    this.socialService.callback({
      token: '123456789',
      name: 'admin',
      id: 10000,
      time: +new Date
    });
  }

  getToken() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic c3dhZ2dlci1jbGllbnQ6c3dhZ2dlci1jbGllbnQtc2VjcmV0'
    });

    const params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', this.code)
      .set('redirect_uri', 'http://localhost:4200/passport/callback/oneportal');


    this.httpClient.post<TokenResponse>(this.url, params.toString(),
      {
        headers,
        responseType: 'json',
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .subscribe((response: TokenResponse) => {
        let accessToken = response.access_token || '';


        const helper = new JwtHelperService();
        const decodedToken = helper.decodeToken(accessToken);
        console.log('decodedToken', decodedToken)

        const info = {
          token: response.access_token,
          name: 'Admin',
          email: decodedToken['sub'],
          time: response.expires_in,
          id_token: response.id_token,
        };

        this.settingsSrv.setUser({
          ...this.settingsSrv.user,
          ...info
        });
        this.socialService.callback(info);
      });
  }
}
