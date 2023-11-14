import {Component} from '@angular/core';

@Component({
  selector: 'app-popup-content',
  template: `
      <nz-alert nzType="warning" nzShowIcon
                nzMessage="Nếu Volume có các bản Snapshot thì các bản Snapshot đó cũng sẽ bị xóa theo Volume"></nz-alert>
      <br>

      <p>Vui lòng cân nhắc thật kỹ trước khi click nút <b style="margin: 5px;"> Đồng ý.</b> Quý khách chắc
          chắn muốn thực hiện xóa
          Volume?
      </p>
  `
})
export class  PopupDeleteVolumeComponent{

}
