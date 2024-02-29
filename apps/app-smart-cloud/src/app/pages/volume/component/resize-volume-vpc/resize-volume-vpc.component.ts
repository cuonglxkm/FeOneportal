import {Component, Inject, OnInit} from '@angular/core';
import {EditSizeMemoryVolumeDTO, VolumeDTO} from "../../../../shared/dto/volume.dto";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {InstancesModel} from "../../../instances/instances.model";
import {EditSizeVolumeModel} from "../../../../shared/models/volume.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {VolumeService} from "../../../../shared/services/volume.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {InstancesService} from "../../../instances/instances.service";
import {ProjectService} from "../../../../shared/services/project.service";

@Component({
  selector: 'one-portal-resize-volume-vpc',
  templateUrl: './resize-volume-vpc.component.html',
  styleUrls: ['./resize-volume-vpc.component.less'],
})
export class ResizeVolumeVpcComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  volumeInfo: VolumeDTO;
  oldSize: number
  expiryTime: any
  validateForm: FormGroup<{
    name: FormControl<string>
    description: FormControl<string>
    storage: FormControl<number>
    radio: FormControl<any>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s]+$/), this.duplicateNameValidator.bind(this)]],
    description: ['', Validators.maxLength(700)],
    storage: [1, [Validators.required]],
    radio: ['']
  });

  nameList: string[] = []

  volumeId: number

  isLoading = false

  iops: number

  selectedValueRadio = 'ssd';

  isVisibleConfirmEdit: boolean = false

  volumeStatus: Map<String, string>;

  listVMs: string = '';

  isVisibleConfirm: boolean = false
  isLoadingConfirm: boolean = false


  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private volumeService: VolumeService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: NonNullableFormBuilder,
              private notification: NzNotificationService,
              private instanceService: InstancesService,
              private projectService: ProjectService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', 'Đang hoạt động');
    this.volumeStatus.set('ERROR', 'Lỗi');
    this.volumeStatus.set('SUSPENDED', 'Tạm ngừng');

  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return {duplicateName: true}; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  regionChanged(region: RegionModel) {
    // this.region = region.regionId
    // this.projectService.getByRegion(this.region).subscribe(data => {
    //   if (data.length){
    //     localStorage.setItem("projectId", data[0].id.toString())
        this.router.navigate(['/app-smart-cloud/volumes'])
    //   }
    // });
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id
    // this.getListVolumes()
    // this.router.navigate(['/app-smart-cloud/volumes'])
  }

  userChangeProject(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/volumes'])
    //
  }
  submitForm() {
    console.log(this.validateForm.getRawValue())
    console.log(this.validateForm.valid)
    if (this.validateForm.valid) {
      this.nameList = []
      this.doEditSizeVolume()
    }
  }

  goBack(): void {
    this.router.navigate(['/app-smart-cloud/volume/detail/' + this.volumeId])
  }

  instance: InstancesModel = new InstancesModel()

  getInstanceById(id) {
    this.instanceService.getInstanceById(id).subscribe(data => {
      this.instance = data
    })
  }

  getVolumeById(idVolume: number) {
    this.volumeService.getVolumeById(idVolume).subscribe(data => {
      if (data !== undefined && data != null) {
        this.volumeInfo = data;
        this.oldSize = data.sizeInGB;
        this.validateForm.controls.name.setValue(data.name)
        this.validateForm.controls.storage.setValue(data.sizeInGB)
        this.validateForm.controls.description.setValue(data.description)
        this.selectedValueRadio = data.volumeType
        this.validateForm.controls.radio.setValue(data.volumeType)

        if (this.volumeInfo?.instanceId != null) {
          this.getInstanceById(this.volumeInfo?.instanceId)
        }

        if (this.volumeInfo.attachedInstances != null) {
          this.volumeInfo.attachedInstances.forEach(item => {
            this.listVMs += item.instanceName.toString() + ', '
          })
        }

        //Thoi gian su dung
        const createDate = new Date(this.volumeInfo?.creationDate);
        const exdDate = new Date(this.volumeInfo?.expirationDate);
        this.expiryTime = (exdDate.getFullYear() - createDate.getFullYear()) * 12 + (exdDate.getMonth() - createDate.getMonth());

      } else {
        this.volumeInfo = null
      }
    })
  }

  volumeEdit: EditSizeMemoryVolumeDTO = new EditSizeMemoryVolumeDTO();

  volumeInit() {
    this.volumeEdit.serviceInstanceId = this.volumeInfo?.id
    this.volumeEdit.regionId = this.volumeInfo?.regionId;
    this.volumeEdit.newSize = this.validateForm.controls.storage.value
    this.volumeEdit.iops = 200
    // editVolumeDto.newOfferId = 0;
    this.volumeEdit.serviceName = this.volumeInfo?.name
    this.volumeEdit.vpcId = this.volumeInfo.vpcId;
    this.volumeEdit.customerId = this.tokenService.get()?.userId;
    this.volumeEdit.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null";
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    1
    this.volumeEdit.actorEmail = user.email;
    this.volumeEdit.userEmail = user.email;
    this.volumeEdit.serviceType = 2;
    this.volumeEdit.actionType = 4; //resize
  }

  doEditSizeVolume() {
    this.volumeInit()
    let request = new EditSizeVolumeModel();
    request.customerId = this.volumeEdit.customerId;
    request.createdByUserId = this.volumeEdit.customerId;
    request.note = 'update volume';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.volumeEdit),
        specificationType: 'volume_resize',
        price: 0,
        serviceDuration: 1
      }
    ]
    this.isLoadingConfirm = true
    this.volumeService.editSizeVolume(request).subscribe(data => {
        if (data.code == 200) {
          this.isLoadingConfirm = false
          this.notification.success('Thành công', 'Điều chỉnh Volume thành công.')
          console.log(data);
          this.router.navigate(['/app-smart-cloud/volumes']);
        } else if (data.code == 310) {
          this.isLoadingConfirm = false;
          // this.router.navigate([data.data]);
          window.location.href = data.data;
        } else {
          this.isLoadingConfirm = false
          this.notification.error('Thất bại', 'Điều chỉnh Volume thất bại.')
        }
      }, error => {
        this.isLoadingConfirm = false
        this.notification.error('Thất bại', 'Điều chỉnh Volume thất bại.')
      }
    );
  }

  showConfirmResize() {
    this.isVisibleConfirm = true
  }

  handleCancelResize() {
    this.isVisibleConfirm = false
  }

  handleOkResize() {
    this.submitForm()
  }

  ngOnInit() {
    this.volumeId = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    if (this.volumeId != undefined || this.volumeId != null) {
      console.log('id', this.volumeId)
      this.getVolumeById(this.volumeId)
    }
  }
}