import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from 'ng-zorro-antd/select';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Router} from "@angular/router";
import {AttachedDto, VolumeDTO} from "../../../../shared/dto/volume.dto";
import {VolumeService} from "../../../../shared/services/volume.service";
import {AddVolumetoVmModel, EditTextVolumeModel, GetAllVmModel} from "../../../../shared/models/volume.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {BaseResponse} from "../../../../../../../../libs/common-utils/src";
import {PopupAddVolumeComponent} from '../popup-volume/popup-add-volume.component';
import {PopupCancelVolumeComponent} from '../popup-volume/popup-cancel-volume.component';
import {PopupDeleteVolumeComponent} from '../popup-volume/popup-delete-volume.component';
import {finalize} from "rxjs/operators";
import {InstancesModel} from "../../../instances/instances.model";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {getCurrentRegionAndProject} from "@shared";
import {ProjectService} from "../../../../shared/services/project.service";

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

  instanceInVolumeSelected: string = ''

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
  volumeDTO: VolumeDTO = new VolumeDTO()

  vmId: number
  listVm: GetAllVmModel

  isVisibleAttachVm: boolean = false
  isLoadingAttachVm: boolean = false

  isVisibleDetachVm: boolean = false
  isLoadingDetachVm: boolean = false

  isVisibleDelete: boolean = false
  isLoadingDelete: boolean = false

  isVisibleUpdate: boolean = false
  isLoadingUpdate: boolean = false

  instanceSelected: any

  listInstanceInVolume: AttachedDto[] = []

  validateForm: FormGroup<{
    nameVolume: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameVolume: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9]*$/),
      Validators.maxLength(70)]],
    description: [null as string, [Validators.maxLength(255)]]
  })

  typeVPC: number

  isBegin: boolean = false;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private volumeService: VolumeService,
              private projectService: ProjectService,
              private notification: NzNotificationService,
              private modalService: NzModalService,
              private cdr: ChangeDetectorRef,
              private fb: NonNullableFormBuilder) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.getListVolume(true)
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id
    this.isLoading = true
    this.getListVolume(true)
  }

  onChange(value) {
    console.log('selected', value)
    this.selectedValue = value
    this.getListVolume(false)
  }

  onInputChange(value) {
    this.value = value
    this.getListVolume(false)
  }

  onPageSizeChange(value) {
    this.pageSize = value
    this.getListVolume(false)
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.getListVolume(false)
  }

  getListVolume(isBegin) {
    this.isLoading = true
    this.customerId = this.tokenService.get()?.userId
    this.loadProjects()
    this.volumeService.getVolumes(this.customerId, this.project,
        this.region, this.pageSize, this.pageIndex, this.selectedValue, this.value)
        .subscribe(data => {
          if(data) {
            this.isLoading = false
            this.response = data
          } else {
            this.isLoading = false
            this.response = null
          }
          if (isBegin) {
            this.isBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
          }
    })
  }

  navigateToCreateVolume() {
    this.router.navigate(['/app-smart-cloud/volume/create'])
  }

  navigateToCreateBackupVolume(id: number, startDate: Date, endDate: Date, nameVolume: string) {
    this.router.navigate(['/app-smart-cloud/backup-volume/create'], {
      queryParams: {
        idVolume: id,
        startDate: startDate,
        endDate: endDate,
        nameVolume: nameVolume
      }
    });
  }

  navigateToCreateVolumeVPC() {
    this.router.navigate(['/app-smart-cloud/volume/vpc/create'])
  }

  showAttachVm(volume: VolumeDTO) {
    this.isVisibleAttachVm = true
    this.volumeDTO = volume
  }

  handleCancelAttachVm() {
    this.isVisibleAttachVm = false
  }

  handleOkAttachVm() {
    console.log('volume', this.volumeDTO)
    this.addVolumeToVm(this.volumeDTO)
  }

  volumeId: number
  showDetachVm(volume: VolumeDTO) {
    this.isVisibleDetachVm = true
    this.volumeDTO = volume
    this.volumeId = volume.id
    this.getListVmInVolume(this.volumeId)
  }

  handleCancelDetachVm() {
    this.isVisibleDetachVm = false
  }

  handleOkDetachVm() {
    this.doDetachVolumeToVm(this.volumeDTO, this.vmId)
  }

  onInstanceChange(value) {
    this.instanceSelected = value
  }

  onInstanceInVolumeChange(value) {
    this.instanceInVolumeSelected = value
  }

  isVisibleNotice: boolean = false
  isLoadingNotice: boolean = false

  showModalNotice() {
    this.isVisibleNotice = true
  }

  handleCancelNotice() {
    this.isVisibleNotice = false
  }

  handleOkNotice() {
    this.isVisibleNotice = false
    this.doDetachVolumeToVm(this.volumeDTO, this.vmId)
  }

  addVolumeToVm(volume: VolumeDTO) {
    this.isLoadingAttachVm = true
    this.volumeService.getVolumeById(volume.id).subscribe(data => {
      if(data != null) {
        if (data.isMultiAttach == false && data.attachedInstances?.length == 1) {
          this.notification.error('Thất bại', 'Volume này chỉ có thể gắn với một máy ảo.')
          this.isLoadingAttachVm = false;
        } else {
          let addVolumetoVmRequest = new AddVolumetoVmModel();

          addVolumetoVmRequest.volumeId = volume.id;
          addVolumetoVmRequest.instanceId = this.instanceSelected;
          addVolumetoVmRequest.customerId = this.tokenService.get()?.userId;

          this.volumeService.addVolumeToVm(addVolumetoVmRequest).subscribe(data => {
            if (data == true) {
              this.isVisibleAttachVm = false
              this.isLoadingAttachVm = false;
              this.notification.success('Thành công', 'Gắn Volume thành công.')
              this.getListVolume(false)
            } else {
              console.log('data', data)
              this.isVisibleAttachVm = false
              this.isLoadingAttachVm = false;
              this.notification.error('Thất bại', 'Gắn Volume thất bại.')
            }
          }, error => {
            console.log('eror', error)
            this.isVisibleAttachVm = false
            this.isLoadingAttachVm = false;
            this.notification.error('Thất bại', 'Gắn Volume thất bại.')
          })
        }
      } else {
        this.isVisibleAttachVm = false
        this.isLoadingAttachVm = false;
        this.notification.error('Thất bại', 'Gắn Volume thất bại.')
        this.getListVolume(false)
      }
    })
  }

  doDetachVolumeToVm(volume: VolumeDTO, vmId: number) {
    this.isLoadingDetachVm = true;

    let addVolumetoVmRequest = new AddVolumetoVmModel();
    addVolumetoVmRequest.volumeId = volume.id;
    addVolumetoVmRequest.instanceId = Number.parseInt(this.instanceInVolumeSelected);
    addVolumetoVmRequest.customerId = this.tokenService.get()?.userId;

    this.volumeService.detachVolumeToVm(addVolumetoVmRequest).subscribe(data => {
      if (data == true) {
        this.isLoadingDetachVm = false;
        this.isVisibleDetachVm = false
        this.notification.success('Thành công', `Gỡ volume thành công`);
        this.getListVolume(false)
      } else {
        this.isLoadingDetachVm = false
        this.isVisibleDetachVm = false
        this.notification.error('Thất bại', `Gỡ volume thất bại`);
        this.getListVolume(false)
      }
    }, error => {
      this.isLoadingDetachVm = false
      this.isVisibleDetachVm = false
      this.notification.error('Thất bại', `Gỡ volume thất bại`);
      this.getListVolume(false)
    })
  }

  getListVmInVolume(volumeId) {
    this.volumeService.getVolumeById(volumeId).subscribe( response => {
      if(response != null){
        if(response?.attachedInstances?.length > 0){
          this.listInstanceInVolume = response.attachedInstances
        }
      }
    })
  }

  getListVm() {
    this.isLoading = true
    this.volumeService.getListVM(this.customerId, this.region).subscribe(data => {
      this.isLoading = false
      this.listVm = data
    })
  }


  showConfirmDelete(volumeId) {
    this.isVisibleDelete = true
    this.volumeId = volumeId
  }

  handleCancelDelete() {
    this.isVisibleDelete = false
    this.isLoadingDelete = false
  }

  handleOkDelete() {
    this.isLoadingDelete = true
    this.volumeService.deleteVolume(this.volumeId).subscribe(data => {
      if(data) {
        this.isLoadingDelete = false
        this.isVisibleDelete = false
        this.notification.success('Thành công', 'Xóa Volume thành công')
        this.getListVolume(false)
      } else {
        console.log('data', data)
        this.isLoadingDelete = false
        this.isVisibleDelete = false
        this.notification.error('Thất bại', 'Xóa Volume thất bại')
        this.getListVolume(false)
      }
    }, error => {
      console.log('error', error)
      this.isLoadingDelete = false
      this.isVisibleDelete = false
      this.notification.error('Thất bại', 'Xóa Volume thất bại')
      this.getListVolume(false)
    })
  }

  //update

  showModalUpdate(volumeDTO: VolumeDTO) {
    this.isVisibleUpdate = true
    this.validateForm.controls.nameVolume.setValue(volumeDTO.name)
    this.validateForm.controls.description.setValue(volumeDTO.description)
    this.volumeId = volumeDTO.id
  }

  handleCancelUpdate() {
    this.isVisibleUpdate = false
  }

  handleOkUpdate() {
    let request: EditTextVolumeModel = new EditTextVolumeModel()
    request.customerId = this.tokenService.get()?.userId
    request.volumeId = this.volumeId
    request.newName = this.validateForm.controls.nameVolume.value
    request.newDescription = this.validateForm.controls.description.value
    this.isLoadingUpdate = true
    this.volumeService.updateVolume(request).subscribe(data => {
      if(data) {
        this.isLoadingUpdate = false
        this.isVisibleUpdate = false
        this.notification.success('Thành công', 'Cập nhật thông tin Volume thành công')
        this.getListVolume(false)
      }
    }, error => {
      this.isLoadingUpdate = false
      this.isVisibleUpdate = false
      this.notification.error('Thất bại', 'Cập nhật thông tin Volume thất bại')
    })
    this.isVisibleUpdate = false
  }

  navigateToCreateScheduleSnapshot() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create'])
  }

  navigateToCreateBackup(id, createdDate, endDate, name) {
    this.router.navigate(['/app-smart-cloud/backup-volume/create'],{
      queryParams:{idVolume:id, startDate: createdDate , endDate: endDate, nameVolume:name }
    });

  }

  navigateToCreateScheduleBackup(){
    this.router.navigate(['/app-smart-cloud/schedule/backup/create']);
  }

  loadProjects() {
    this.projectService.getByRegion(this.region).subscribe(data => {
      let project = data.find(project => project.id === +this.project);
      if (project) {
        this.typeVPC = project.type
      }
    });
  }
  ngOnInit() {

    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    console.log('project', this.project)
    this.customerId = this.tokenService.get()?.userId
    if (this.project && this.region) {
      this.loadProjects()
    }
    this.getListVm()
    this.getListVolume(true)
    this.cdr.detectChanges();

  }

}
