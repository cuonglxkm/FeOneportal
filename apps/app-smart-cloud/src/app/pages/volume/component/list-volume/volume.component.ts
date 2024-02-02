import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from 'ng-zorro-antd/select';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Router} from "@angular/router";
import {VolumeDTO} from "../../../../shared/dto/volume.dto";
import {VolumeService} from "../../../../shared/services/volume.service";
import {AddVolumetoVmModel} from "../../../../shared/models/volume.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {BaseResponse} from "../../../../../../../../libs/common-utils/src";
import {PopupAddVolumeComponent} from '../popup-volume/popup-add-volume.component';
import {PopupCancelVolumeComponent} from '../popup-volume/popup-cancel-volume.component';
import {PopupDeleteVolumeComponent} from '../popup-volume/popup-delete-volume.component';
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-volume',
  templateUrl: './volume.component.html',
  styleUrls: ['./volume.component.less'],
})

export class VolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  listVolumes: VolumeDTO[] = []
  isLoading: boolean = false

  selectedValue: string = ''
  customerId: number

  value: string

  options = [
    {label: 'Tất cả trạng thái', value: null},
    {label: 'Đang hoạt động', value: 'KHOITAO'},
    {label: 'Lỗi', value: 'ERROR'},
    {label: 'Tạm ngừng', value: 'SUSPENDED'},
  ];

  pageSize: number = 10
  pageIndex: number = 1

  response: BaseResponse<VolumeDTO[]>

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private volumeService: VolumeService,
              private notification: NzNotificationService,
              private modalService: NzModalService,
              private cdr: ChangeDetectorRef) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.getListVolume()
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id
  }

  onChange(value) {
    this.selectedValue = value
  }

  onInputChange(value) {
    this.value = value
    this.getListVolume()
  }

  onPageSizeChange(value) {
    this.pageSize = value
    this.getListVolume()
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.getListVolume()
  }
  getListVolume() {
    this.isLoading = true
    this.customerId = this.tokenService.get()?.userId
    this.volumeService.getVolumes(this.customerId, this.project,
        this.region, this.pageSize, this.pageIndex, this.selectedValue, this.value)
        .subscribe(data => {
          this.response = data
    })
  }

  navigateToCreateVolume() {
    this.router.navigate(['/app-smart-cloud/volume/create`'])
  }

  ngOnInit() {
  }

}
