import {Component, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {EditTextVolumeModel, GetAllVmModel} from "../../../../shared/models/volume.model";
import {VmDto} from "../../../../shared/dto/volume.dto";
import { VolumeService } from "../../../../shared/services/volume.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {VolumeDTO} from "../../../../shared/dto/volume.dto";
import {ActivatedRoute, Router} from "@angular/router";

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

  oldSize: number;
  oldName: string;
  oldDescription: string;



  regionIdSearch: number;
  projectIdSearch: number;

  vmList: NzSelectOptionInterface[] = [];
  expiryTimeList: NzSelectOptionInterface[] = [
    {label: '1', value: 1},
    {label: '3', value: 3},
    {label: '6', value: 6},
    {label: '12', value: 12},
    {label: '24', value: 24},
  ];
  snapshotList: NzSelectOptionInterface[] = [];

  expiryTime: any;
  isInitSnapshot = false;
  snapshot: any;
  protected readonly onchange = onchange;


  changeExpTime() {
    console.log('ExpTime: ', this.expiryTime);
  }
  constructor(private volumeSevice: VolumeService,private nzMessage:NzMessageService, private activatedRoute: ActivatedRoute ,private router: Router) {
  }

  async ngOnInit(): Promise<void> {

    const idVolume = this.activatedRoute.snapshot.paramMap.get('id');
    this.getVolumeById(idVolume);


    this.getAllVmResponse = await this.volumeSevice.getAllVMs(this.regionIdSearch).toPromise();
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
        this.oldSize = data.sizeInGB;


        //Thoi gian su dung
        const createDate = new Date(this.volumeInfo.createDate);
        const exdDate = new Date(this.volumeInfo.expireDate);
        this.expiryTime = (exdDate.getFullYear() - createDate.getFullYear()) * 12 + (exdDate.getMonth() - createDate.getMonth());

      }else{

      }

    })
  }

  changeVolumeType(){
    this.nzMessage.create('warning', 'Không thể thay đổi loại Volume.')
  }
  getProjectId(projectId: number){
    this.projectIdSearch = projectId;
  }

  async getRegionId(regionId: number){
    this.regionIdSearch = regionId;

    this.vmList = [];
    this.getAllVmResponse = await this.volumeSevice.getAllVMs(this.regionIdSearch).toPromise();
    this.listAllVMs = this.getAllVmResponse.records;
    this.listAllVMs.forEach((vm) => {
      this.vmList.push({value: vm.id ,label: vm.name});
    })
  }

  editVolume(){
    if(this.oldSize !== this.volumeInfo.sizeInGB){
      console.log('Call API Create.')
    }else{
      console.log('Call API PUT')
      this.doEditSizeVolume();
    }
  }

  async doEditSizeVolume(){
    let request = new EditTextVolumeModel();
    request.volumeId = this.volumeInfo.id;
    request.newDescription =  this.volumeInfo.description;
    request.newName = this.volumeInfo.name;
    let response = this.volumeSevice.editTextVolume(request).toPromise();
    if(await response == true){
      this.nzMessage.create('success', 'Chỉnh sửa thông tin Volume thành công.');
      this.router.navigate(['/app-smart-cloud/volume']);
    }else
      return false;

  }
  private doEditTextVolume(){

  }


}
