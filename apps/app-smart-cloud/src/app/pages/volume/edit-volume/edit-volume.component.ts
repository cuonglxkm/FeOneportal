import {Component, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {GetAllVmModel} from "../model/get-all-vm.model";
import {VmDto} from "../dto/vm.dto";
import {VolumeService} from "../volume.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {VolumeDTO} from "../dto/volume.dto";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-edit-volume',
  templateUrl: './edit-volume.component.html',
  styleUrls: ['./edit-volume.component.less'],
})
export class EditVolumeComponent implements OnInit {

  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Volume',
    content: 'Chỉnh sửa Volume '
  };

  getAllVmResponse: GetAllVmModel;
  listAllVMs: VmDto[] = [];

  volumeInfo: VolumeDTO;

  volumeName = '';
  vmList: NzSelectOptionInterface[] = [];
  expiryTimeList: NzSelectOptionInterface[] = [
    {label: '1', value: '1'},
    {label: '6', value: '6'},
    {label: '12', value: '12'},
  ];
  snapshotList: NzSelectOptionInterface[] = [];

  expiryTime: any;
  isInitSnapshot = false;
  snapshot: any;
  protected readonly onchange = onchange;


  changeExpTime() {
    console.log('ExpTime: ', this.expiryTime);
  }
  constructor(private volumeSevice: VolumeService,private nzMessage:NzMessageService, private activatedRoute: ActivatedRoute) {
  }

  async ngOnInit(): Promise<void> {

    const idVolume = this.activatedRoute.snapshot.paramMap.get('id');
    this.getVolumeById(idVolume);


    this.getAllVmResponse = await this.volumeSevice.getAllVMs(3).toPromise();
    this.listAllVMs = this.getAllVmResponse.records;
    this.listAllVMs.forEach((vm) => {
      this.vmList.push({value: vm.id ,label: vm.name});
    })

  }
  private getVolumeById(idVolume: string) {
    this.volumeSevice.getVolummeById(idVolume).subscribe(data => {
      if (data !== undefined && data != null){
        this.nzMessage.create('success', 'Tìm kiếm thông tin Volume thành công.')
        this.volumeInfo = data;

        //Thoi gian su dung
        // const createDate = new Date(this.volumeInfo.createDate);
        // const exdDate = new Date(this.volumeInfo.expireDate);
        // const driffMonth = (exdDate.getFullYear() - createDate.getFullYear()) * 12 + (exdDate.getMonth() - createDate.getMonth());
        // console.log(driffMonth);

      }else{

      }

    })
  }


  protected readonly VolumeDTO = VolumeDTO;
}
