import {Component} from '@angular/core';

@Component({
  selector: 'app-popup-attach-policy',
  template: `
      <nz-alert nzType="warning" nzShowIcon nzMessage="Bạn đang thực hiện Attach policy"></nz-alert>
      <br>
      <p><b>Để thực hiện Attach Policy, vui lòng chọn "Đồng ý". để thực hiện</b></p>
  `
})
export class PopupAttachPolicyComponent {

}
