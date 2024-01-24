import {Component} from '@angular/core';

@Component({
  selector: 'app-popup-detach-policy',
  template: `
      <nz-alert nzType="warning" nzShowIcon nzMessage="Bạn đang thực hiện Detach policy"></nz-alert>
      <br>
      <p><b>Để thực hiện Detach Policy, vui lòng chọn "Đồng ý". để thực hiện</b></p>
  `
})
export class PopupDetachPolicyComponent {

}
