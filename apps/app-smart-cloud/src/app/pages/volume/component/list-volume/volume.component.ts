import {Component, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from 'ng-zorro-antd/select';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {PopupAddVolumeComponent} from "../popup-volume/popup-add-volume.component";
import {PopupDeleteVolumeComponent} from "../popup-volume/popup-delete-volume.component";
import {Router} from "@angular/router";
import {VolumeDTO} from "../../../../shared/dto/volume.dto";
import { VolumeService } from "../../../../shared/services/volume.service";
import {GetListVolumeModel} from "../../../../shared/models/volume.model";
import {NzMessageService} from "ng-zorro-antd/message";

interface Volume {
  name: string;
  storage: number;
  iops: number;
  statusVolume: number;
  statusAction: number;
  vm: string;
}

@Component({
  selector: 'app-volume',
  templateUrl: './volume.component.html',
  styleUrls: ['./volume.component.less'],
})
export class VolumeComponent implements OnInit {

  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Volume',
    content: 'Danh sách Volume'
  };

  volumeNameSearch: string;
  volumeStatusSearch: string;

  listVolumeRootResponse: GetListVolumeModel;
  listVolumeAddVolumeResponse: GetListVolumeModel;

  listVolumeRoot: VolumeDTO[];
  listVolumeAdd: VolumeDTO[];
  totalRoot: number;
  totalAdd: number;
  curentPageRoot: number = 0;
  curentPageAdd: number = 0;
  tabVolumeIndex: number = 0;



  combinedValues: string[] = [];

  selectedOption: NzSelectOptionInterface | null = null;
  options: NzSelectOptionInterface[] = [
    {label: 'Tất cả trạng thái', value: null},
    {label: 'Đang hoạt động', value: 'KHOITAO'},
    {label: 'Lỗi', value: 'ERROR'},
    {label: 'Tạm ngừng', value: 'SUSPENDED'},
  ];

  optionVolumeRoot: NzSelectOptionInterface[] = [
    {label: 'Tạo Snapshot', value: 'initSnapshot'}
  ]

  optionVolumeAdd: NzSelectOptionInterface[] = [
    {label: 'Gắn Volume', value: 'addVolume'},
    {label: 'Gỡ Volume', value: 'cancelVolume'},
    {label: 'Tạo Backup', value: 'initBackup'},
    {label: 'Tạo lịch Snapshot', value: 'initScheduleSnapshot'},
    {label: 'Xóa', value: 'delete'}

  ]

  volumeStatus: Map<String, string>;

  constructor(private modalService: NzModalService, private router: Router, private volumeSevice: VolumeService , private message:NzMessageService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', 'Đang hoạt động');
    this.volumeStatus.set('ERROR', 'Lỗi');
    this.volumeStatus.set('SUSPENDED', 'Tạm ngừng');
  }

  ngOnInit() {
    //get list Root
    this.getListVolume(null, null, 3, true, 10, 0 , null , null)
    //get list Add
    // this.getListVolume(null, null, 3, false, 10, 0 , null, null)
  }

  onRootPageIndexChange(event: any) {
    this.curentPageRoot = event;
    this.getListVolume(null, null, 3, true, 10, (this.curentPageRoot - 1), this.volumeStatusSearch, this.volumeNameSearch)
  }

  onAddPageIndexChange(event: any) {
    this.curentPageAdd = event;
    this.getListVolume(null, null, 3, false, 10, (this.curentPageAdd - 1),this.volumeStatusSearch,this.volumeNameSearch)
  }

  isVisible = false;

  onSelectionChange(value: any, idVolume: number) {
    console.log('Value selected: ', value);
    console.log('Volume Name: ', idVolume);
    if (value === 'addVolume') {
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Gắn Volume',
        nzContent: PopupAddVolumeComponent,
        nzFooter: [
          {
            label: 'Hủy',
            type: 'default',
            onClick: () => modal.destroy()
          },
          {
            label: 'Xác nhận',
            type: 'primary',
            onClick: () => {
              const selected = modal.getContentComponent().selectedItem;
              console.log('Add volume ' + idVolume + ' in to ' + selected);
              this.message.create('success', `Add Volume Success`);
              modal.destroy()
            }
          }
        ]
      });
    }

    if (value === 'cancelVolume') {
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Gỡ Volume',
        nzContent: PopupAddVolumeComponent,
        nzFooter: [
          {
            label: 'Hủy',
            type: 'default',
            onClick: () => modal.destroy()
          },
          {
            label: 'Xác nhận',
            type: 'primary',
            onClick: () => {
              const selected = modal.getContentComponent().selectedItem;
              this.message.create('success', `Delete Volume Success`);
              modal.destroy();
            }
          }
        ]
      });
    }

    if (value === 'delete') {
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Xóa Volume',
        nzWidth: '600px',
        nzContent: PopupDeleteVolumeComponent,
        nzFooter: [
          {
            label: 'Hủy',
            type: 'default',
            onClick: () => modal.destroy()
          },
          {
            label: 'Đồng ý',
            type: 'primary',
            onClick: () => {
              modal.destroy();
            }
          }
        ]
      });
    }

  }

  navigateToCreateVolume() {
    this.router.navigate(['/app-smart-cloud/volume/create']);
  }

  searchVolumes() {
    // tabIndex = 0 : RootVolume
    // tabIndex = 1 : AddVolume
    if(this.tabVolumeIndex == 0 ){
      this.getListVolume(null, null, 3, true, 10, 0, this.volumeStatusSearch , this.volumeNameSearch)
    }else{
      this.getListVolume(null, null, 3, false, 10, 0, this.volumeStatusSearch , this.volumeNameSearch)
    }

  }

  reloadDataVolumeRoot( ){
    this.getListVolume(null, null, 3, true, 10, 0, null , null)
    this.volumeNameSearch = null;
    this.volumeStatusSearch = null;
  }
  reloadDataVolumeAdd( ){
    this.getListVolume(null, null, 3, false, 10, 0, null , null)
    this.volumeNameSearch = null;
    this.volumeStatusSearch = null;
  }

  getDetailVolume(idVolume: number){
    console.log(idVolume);
    this.router.navigate(['/app-smart-cloud/volume/detail/'+idVolume]);
  }


  private getListVolume(userId: number, vpcId: number, regionId: number, volumeRootOnly: boolean, pageSize: number, currentPage: number, status: string, volumeName: string) {
    this.volumeSevice.getVolumes(userId, vpcId, regionId, volumeRootOnly, pageSize, currentPage ,status , volumeName).subscribe(data => {

      if(volumeRootOnly === true ){
        this.listVolumeRootResponse = data;
        this.listVolumeRoot = data.records;
        this.totalRoot = data.totalCount;
        this.message.create('success', `Tìm kiếm Volume thành công.`);
      }else{
        this.listVolumeAddVolumeResponse = data;
        this.listVolumeAdd = data.records;
        this.totalAdd = data.totalCount;
        this.message.create('success', `Tìm kiếm Volume thành công.`);
      }
    })
  }


}
