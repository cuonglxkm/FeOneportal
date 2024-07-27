import { Component, Inject, OnInit } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {ALAIN_I18N_TOKEN} from "@delon/theme";
import {I18NService} from "@core";
import { environment } from '@env/environment';

@Component({
  selector: 'layout-passport',
  templateUrl: './passport.component.html',
  styleUrls: ['./passport.component.less']
})
export class LayoutPassportComponent implements OnInit {
  links = [

  ];

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) {}

  ngOnInit(): void {
    this.tokenService.clear();
  }

  navigateToCloud(event: Event){
    event.preventDefault()
    window.location.href = environment.sso.cloud_baseUrl;
  }
}
