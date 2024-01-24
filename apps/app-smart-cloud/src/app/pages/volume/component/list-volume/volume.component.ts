import {Component, Inject, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from 'ng-zorro-antd/select';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Router} from "@angular/router";
import {VolumeDTO} from "../../../../shared/dto/volume.dto";
import {VolumeService} from "../../../../shared/services/volume.service";
import {AddVolumetoVmModel, GetListVolumeModel} from "../../../../shared/models/volume.model";
import {NzMessageService} from "ng-zorro-antd/message";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {debounce, debounceTime} from "rxjs";
import {BaseResponse} from "../../../../../../../../libs/common-utils/src";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import { PopupAddVolumeComponent } from '../popup-volume/popup-add-volume.component';
import { PopupCancelVolumeComponent } from '../popup-volume/popup-cancel-volume.component';
import { PopupDeleteVolumeComponent } from '../popup-volume/popup-delete-volume.component';

@Component({
  selector: 'app-volume',
  templateUrl: './volume.component.html',
  styleUrls: ['./volume.component.less'],
})

export class VolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  selectedValue?: string = null

  isBlankVolume = false;

  pageSize = 10
  pageIndex = 1

  userId: number

  options = [
    {label: 'Tất cả trạng thái', value: 'all'},
    {label: 'Đang hoạt động', value: 'KHOITAO'},
    {label: 'Lỗi', value: 'ERROR'},
    {label: 'Tạm ngừng', value: 'SUSPENDED'},
  ];

  // optionVolumeRoot: NzSelectOptionInterface[] = [
  //   {label: 'Tạo Snapshot', value: 'initSnapshot'}
  // ]

  optionVolumeAdd: NzSelectOptionInterface[] = [
    {label: 'Gắn Volume', value: 'addVolume'},
    {label: 'Gỡ Volume', value: 'cancelVolume'},
    {label: 'Tạo Backup', value: 'initBackup'},
    {label: 'Tạo lịch Snapshot', value: 'initScheduleSnapshot'},
    {label: 'Xóa', value: 'delete'}

  ]

  isLoading: boolean = false

  status: string

  response: BaseResponse<VolumeDTO[]>

  value: string = ''

  selectedOptionAction: any = ''

  isLoadingAction = false

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private volumeService: VolumeService,
              private notification: NzNotificationService,
              private modalService: NzModalService) {
  }



  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id
    this.getListVolumes()
  }

  onChange(value: string) {
    this.selectedValue = value;
    if (this.selectedValue === 'all') {
      this.status = null
    } else {
      this.status = value
    }
    this.pageIndex = 1
    //get list
    this.getListVolumes()
  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.pageSize = pageSize;
    this.pageIndex = pageIndex
    this.getListVolumes();
  }

  getListVolumes() {
    this.isLoading = true
    this.volumeService.getVolumes(this.userId, this.project, this.region,
      this.pageSize, this.pageIndex, this.status, this.value)
      .subscribe(data => {
        this.isLoading = false
        this.response = data
      }, error => {
        this.isLoading = false
        this.response = null
      })
  }

  ngOnInit() {
    this.userId = this.tokenService.get()?.userId
    this.pageSize = 10
    this.pageIndex = 1
    this.getListVolumes()
  }

  // onRootPageIndexChange(event: any) {
  //   this.curentPageRoot = event;
  //   this.getListVolume(this.userId, this.projectSearch, this.regionSearch, true, 10, this.curentPageRoot, this.volumeStatusSearch, this.volumeNameSearch)
  // }
  //
  // onAddPageIndexChange(event: any) {
  //   this.curentPageAdd = event;
  //   this.getListVolume(this.userId, this.projectSearch, this.regionSearch, false, 10, this.curentPageAdd, this.volumeStatusSearch, this.volumeNameSearch)
  // }
  //
  // isVisible = false;
  //
  onSelectionChange(value: any, volume: VolumeDTO) {
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
                this.notification.error('Thất bại', `Chọn máy ảo cho volume`);
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
                this.notification.success('Thành công', `Xóa volume ` + volume.name + 'thành công');
                this.getListVolumes();
              } else {
                this.notification.error('Thất bại', `Xóa volume ` + volume.name + 'thất bại');
                console.log('Delete volume Fail: ' + volume.name);
              }
              modal.destroy();
            }
          }
        ]
      });
    }

    if (value === 'initBackup') {
      this.router.navigate(['/app-smart-cloud/backup-volume/create'],{
        queryParams:{idVolume:volume.id, startDate: volume.creationDate , endDate: volume.expirationDate, nameVolume:volume.name }
      });
    }
  }
  //
  navigateToCreateVolume() {
    this.router.navigate(['/app-smart-cloud/volume/create']);
  }
  async doDeleteVolume(volumeId: number): Promise<any> {
    let result = this.volumeService.deleteVolume(volumeId).toPromise();
    return !!result;
  }
  //
  addVolumeToVM(volume: VolumeDTO, vmId: number): void {
    this.volumeService.getVolummeById(volume.id).toPromise().then(data => {
      if (data != null) {
        this.isLoadingAction = true;
        if (data.isMultiAttach == false && data.attachedInstances.length == 1) {
          this.notification.error('Thất bại', 'Volume này chỉ có thể gắn với một máy ảo.')
          this.isLoadingAction = false;
        } else {

          let addVolumetoVmRequest = new AddVolumetoVmModel();

          addVolumetoVmRequest.volumeId = volume.id;
          addVolumetoVmRequest.instanceId = vmId;
          addVolumetoVmRequest.customerId = this.tokenService.get()?.userId;
          this.volumeService.addVolumeToVm(addVolumetoVmRequest).toPromise().then(data => {
            if (data == true) {
              this.notification.success('Thành công', 'Gắn Volume thành công.')
            }
            this.isLoadingAction = false;
          })
        }
      } else{
        this.notification.error('Thất bại', 'Gắn Volume thất bại.')
        this.isLoadingAction = false;
      }
    })
  }
  //
  doDetachVolumeToVm(volume: VolumeDTO, vmId: number) {
    this.isLoadingAction = true;
    let addVolumetoVmRequest = new AddVolumetoVmModel();
    addVolumetoVmRequest.volumeId = volume.id;
    addVolumetoVmRequest.instanceId = vmId;
    addVolumetoVmRequest.customerId = this.tokenService.get()?.userId;
    this.volumeService.detachVolumeToVm(addVolumetoVmRequest).toPromise().then(data => {
      if (data == true) {
        this.notification.success('Thành công', `Gỡ volume thành công`);
        this.isLoadingAction = false;
      } else {
        this.notification.error('Thất bại', `Gỡ volume thất bại`);
        this.isLoadingAction = false;
      }
    })
  }


}
