import {Component, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {GetAllVmModel} from "../model/get-all-vm.model";
import {VmDto} from "../dto/vm.dto";
import {VolumeService} from "../volume.service";

@Component({
  selector: 'app-create-volume',
  templateUrl: './create-volume.component.html',
  styleUrls: ['./create-volume.component.less'],
})
export class CreateVolumeComponent implements OnInit {

  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Volume',
    content: 'Tạo Volume '
  };

  getAllVmResponse: GetAllVmModel;
  listAllVMs: VmDto[] = [];

  volumeName = '';
  vmList: NzSelectOptionInterface[] = [];
  expiryTimeList: NzSelectOptionInterface[] = [
    {label: '1', value: '1'},
    {label: '6', value: '6'},
    {label: '12', value: '12'},
  ];
  snapshotList: NzSelectOptionInterface[] = [];

  expiryTime: any;
  storage = 1;
  isEncode = false;
  isAddVms = false;
  isInitSnapshot = false;
  snapshot: any;
  mota = '';
  protected readonly onchange = onchange;

  radioValue = '1';

  changeExpTime() {
    console.log('ExpTime: ', this.expiryTime);
  }
  constructor(private volumeSevice: VolumeService) {
  }

  async ngOnInit(): Promise<void> {

    this.getAllVmResponse = await this.volumeSevice.getAllVMs(3).toPromise();
    this.listAllVMs = this.getAllVmResponse.records;
    this.listAllVMs.forEach((vm) => {
      this.vmList.push({value: vm.id ,label: vm.name});
    })

  }


}
