import {Component} from '@angular/core';
import {NzSelectOptionInterface} from "ng-zorro-antd/select";


@Component({
  selector: 'app-detail-volume',
  templateUrl: './detail-volume.component.html',
  styleUrls: ['./detail-volume.component.less'],
})
export class DetailVolumeComponent {
  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Volume',
    content: 'Chi tiết Volume '
  };

}
