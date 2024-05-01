import {Component} from '@angular/core';

@Component({
  selector: 'app-popup-attach-policy',
  template: `
      <nz-alert nzType="warning" nzShowIcon [nzMessage]="'app.attach-policy.confirm' | i18n"></nz-alert>
      <br>
      <p><b>{{'app.attach-policy.confirm.des' | i18n}}</b></p>
  `
})
export class PopupAttachPolicyComponent {

}
