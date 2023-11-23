import {Component, Inject, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from 'ng-zorro-antd/select';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {PopupAddVolumeComponent} from "../popup-volume/popup-add-volume.component";
import {PopupDeleteVolumeComponent} from "../popup-volume/popup-delete-volume.component";
import {Router} from "@angular/router";
import {VolumeDTO} from "../../../../shared/dto/volume.dto";
import {VolumeService} from "../../../../shared/services/volume.service";
import {AddVolumetoVmModel, GetListVolumeModel} from "../../../../shared/models/volume.model";
import {NzMessageService} from "ng-zorro-antd/message";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {isBlank} from "@delon/form";
import {PopupCancelVolumeComponent} from "../popup-volume/popup-cancel-volume.component";

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

  selectedOptionAction: string = '';

  regionSearch: number;
  projectSearch: number;
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

  isLoadingSearch = true;
  isLoadingAction: boolean = false;


  isBlankVolume = true;

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

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private modalService: NzModalService, private router: Router, private volumeSevice: VolumeService, private message: NzMessageService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', 'Đang hoạt động');
    this.volumeStatus.set('ERROR', 'Lỗi');
    this.volumeStatus.set('SUSPENDED', 'Tạm ngừng');
  }

  ngOnInit() {
    // const regionString = localStorage.getItem('region');
    // const region = JSON.parse(regionString);
    // const projectId = localStorage.getItem('projectId')!=null?parseInt(localStorage.getItem('projectId')):null;
    // this.getListVolume(null, projectId, region.regionId, true, 10, 0 , null , null)
  }

  onRootPageIndexChange(event: any) {
    this.curentPageRoot = event;
    this.getListVolume(null, this.projectSearch, this.regionSearch, true, 10, (this.curentPageRoot - 1), this.volumeStatusSearch, this.volumeNameSearch)
  }

  onAddPageIndexChange(event: any) {
    this.curentPageAdd = event;
    this.getListVolume(null, this.projectSearch, this.regionSearch, false, 10, (this.curentPageAdd - 1), this.volumeStatusSearch, this.volumeNameSearch)
  }

  isVisible = false;

  onSelectionChange(value: any, volume: any) {
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
              if (selected !== undefined) {
                console.log('Add volume ' + volume.id + ' in to ' + selected);
                this.addVolumeToVM(volume, selected);
                modal.destroy()
              } else {
                this.message.create('error', `Please choose VM for add Volume.`);
              }

            }
          }
        ]
      });
    }

    if (value === 'cancelVolume') {
      const modal: NzModalRef = this.modalService.create({
        nzTitle: 'Gỡ Volume',
        nzContent: PopupCancelVolumeComponent,
        nzData: volume.id,
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
              console.log('Delete volume ' + volume.id + ' from ' + selected);
              this.doDetachVolumeToVm(volume, selected);
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

              let deleteVolume = this.doDeleteVolume(volume.id);
              if (deleteVolume) {
                this.message.create('success', `Delete Volume Success: ` + volume.name);
                this.searchVolumes();
              } else {
                this.message.create('error', `Delete Volume Fail: ` + volume.name);
                console.log('Delete volume Fail: ' + volume.name);
              }
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
    if (this.tabVolumeIndex == 0) {
      this.getListVolume(null, this.projectSearch, this.regionSearch, true, 10, 0, this.volumeStatusSearch, this.volumeNameSearch)
    } else {
      this.getListVolume(null, this.projectSearch, this.regionSearch, false, 10, 0, this.volumeStatusSearch, this.volumeNameSearch)
    }
  }

  reloadDataVolumeRoot() {
    this.getListVolume(null, this.projectSearch, this.regionSearch, true, 10, 0, null, null)
    this.volumeNameSearch = null;
    this.volumeStatusSearch = null;
  }

  reloadDataVolumeAdd() {
    this.getListVolume(null, this.projectSearch, this.regionSearch, false, 10, 0, null, null)
    this.volumeNameSearch = null;
    this.volumeStatusSearch = null;
  }

  getDetailVolume(idVolume: number) {
    console.log(idVolume);
    this.router.navigate(['/app-smart-cloud/volume/detail/' + idVolume]);
  }


  private getListVolume(userId: number, vpcId: number, regionId: number, volumeRootOnly: boolean, pageSize: number, currentPage: number, status: string, volumeName: string) {
    this.isLoadingSearch = true;
    this.volumeSevice.getVolumes(userId, vpcId, regionId, volumeRootOnly, pageSize, currentPage, status, volumeName).subscribe(data => {

      if (volumeRootOnly === true) {
        if (data.records.length > 0) {
          this.listVolumeRootResponse = data;
          this.listVolumeRoot = data.records;
          this.totalRoot = data.totalCount;
          this.isLoadingSearch = false;
          this.isBlankVolume = false;
        } else
          this.isBlankVolume = true;

      } else {
        if (data.records.length > 0) {
          this.listVolumeAddVolumeResponse = data;
          this.listVolumeAdd = data.records;
          this.totalAdd = data.totalCount;
          this.isLoadingSearch = false;
          this.isBlankVolume = false;
        } else
          this.isBlankVolume = true;

      }
    })
  }

  async doDeleteVolume(volumeId: number): Promise<any> {
    let result = this.volumeSevice.deleteVolume(volumeId).toPromise();
    return !!result;
  }

  addVolumeToVM(volume: VolumeDTO, vmId: number): void {
    this.volumeSevice.getVolummeById(volume.id.toString()).toPromise().then(data => {
      if (data != null) {
        this.isLoadingAction = true;
        if (data.isMultiAttach == false && data.attachedInstances.length == 1) {
          this.message.create('error', 'Volume này chỉ có thể gắn với một máy ảo.')
          this.isLoadingAction = false;
        } else {

          let addVolumetoVmRequest = new AddVolumetoVmModel();

          addVolumetoVmRequest.volumeId = volume.id;
          addVolumetoVmRequest.instanceId = vmId;
          addVolumetoVmRequest.customerId = this.tokenService.get()?.userId;
          this.volumeSevice.addVolumeToVm(addVolumetoVmRequest).toPromise().then(data => {
            if (data == true) {
              this.message.create('success', 'Gắn Volume thành công.')
            }
            this.isLoadingAction = false;
          })
        }
      } else{
        this.message.create('error', 'Gắn Volume thất bại.')
        this.isLoadingAction = false;
      }
    })
  }

  doDetachVolumeToVm(volume: VolumeDTO, vmId: number) {
    this.isLoadingAction = true;
    let addVolumetoVmRequest = new AddVolumetoVmModel();
    addVolumetoVmRequest.volumeId = volume.id;
    addVolumetoVmRequest.instanceId = vmId;
    addVolumetoVmRequest.customerId = this.tokenService.get()?.userId;
    this.volumeSevice.detachVolumeToVm(addVolumetoVmRequest).toPromise().then(data => {
      if (data == true) {
        this.message.create('success', `Detach Volume Success`);
        this.isLoadingAction = false;
      } else {
        this.message.create('error', `Detach Volume Fail`);
        this.isLoadingAction = false;
      }
    })
  }

  getProjectId(projectId: number) {
    this.projectSearch = projectId;
    this.searchVolumes();
  }

  getRegionId(regionId: number) {
    this.regionSearch = regionId;
    if(this.projectSearch != null){
      this.searchVolumes();
    }

  }

  protected readonly isBlank = isBlank;
}