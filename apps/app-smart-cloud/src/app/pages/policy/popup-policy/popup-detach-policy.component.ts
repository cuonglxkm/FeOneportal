import {Component} from '@angular/core';

@Component({
  selector: 'app-popup-detach-policy',
  template: `
      <nz-alert nzType="warning" nzShowIcon [nzMessage]="'app.detach-policy.confirm' | i18n "></nz-alert>
      <br>
      <p><b>{{ 'app.detach-policy.confirm.des' | i18n }}</b></p>
  `
})
export class PopupDetachPolicyComponent {

}
