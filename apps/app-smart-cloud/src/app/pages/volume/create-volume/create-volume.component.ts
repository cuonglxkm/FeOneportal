import {Component} from '@angular/core';
import {NzSelectOptionInterface} from "ng-zorro-antd/select";


@Component({
  selector: 'app-create-volume',
  templateUrl: './create-volume.component.html',
  styleUrls: ['./ceate-volume.component.less'],
})
export class CreateVolumeComponent {
  volumeName = '';
  vmList: NzSelectOptionInterface[] = [
    {label: 'VM01', value: 'vm01'},
    {label: 'VM02', value: 'vm02'},
    {label: 'VM03', value: 'vm03'},
  ];
  expiryTimeList: NzSelectOptionInterface[] = [
    {label: '1', value: '1'},
    {label: '6', value: '6'},
    {label: '12', value: '12'},
  ];
  snapshotList: NzSelectOptionInterface[] = [
    {label: 'Snapshot-01', value: 'sn01'},
    {label: 'Snapshot-02', value: 'sn02'},
    {label: 'Snapshot-03', value: 'sn03'},
  ];

  expiryTime : any;
  storage = 1;
  isEncode = false;
  isAddVms = false;
  isInitSnapshot = false;
  snapshot : any;
  mota = '';
  protected readonly onchange = onchange;

  radioValue = 'A';
  changeExpTime(){
    console.log('ExpTime: ', this.expiryTime);
  }
}
