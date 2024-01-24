import {Component, Inject, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {EditSizeVolumeModel, EditTextVolumeModel, GetAllVmModel} from "../../../../shared/models/volume.model";
import {EditSizeMemoryVolumeDTO, PriceVolumeDto, VmDto} from "../../../../shared/dto/volume.dto";
import {VolumeService} from "../../../../shared/services/volume.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {VolumeDTO} from "../../../../shared/dto/volume.dto";
import {ActivatedRoute, Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {InstancesModel} from "../../../instances/instances.model";
import {InstancesService} from "../../../instances/instances.service";

@Component({
  selector: 'app-edit-volume',
  templateUrl: './edit-volume.component.html',
  styleUrls: ['./edit-volume.component.less'],
})
export class EditVolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  // priceVolumeInfo: PriceVolumeDto = {
  //   price: 0,
  //   totalPrice: 0,
  //   tax: 0
  // };
  //
  // getAllVmResponse: GetAllVmModel;
  // listAllVMs: VmDto[] = [];
  //
  volumeInfo: VolumeDTO;
  oldSize: number;
  // oldName: string;
  // oldDescription: string;
  //
  //
  // regionIdSearch: number;
  // projectIdSearch: number;
  //
  // vmList: NzSelectOptionInterface[] = [];
  //
  // snapshotList: NzSelectOptionInterface[] = [];
  //
  expiryTime: any;
  // isInitSnapshot = false;
  // snapshot: any;

  validateForm: FormGroup<{
    name: FormControl<string>
    description: FormControl<string>,
    storage: FormControl<number>
  }> = this.fb.group({
    name: ['',[Validators.required, Validators.pattern(/^[a-zA-Z0-9\s]+$/), this.duplicateNameValidator.bind(this)]],
    description: ['', Validators.maxLength(700)],
    storage: [0, [Validators.required]]
  });

  nameList: string[] = []

  volumeId: number

  isLoading = false



  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private volumeService: VolumeService,
              private nzMessage: NzMessageService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: NonNullableFormBuilder,
              private notification: NzNotificationService,
              private instanceService: InstancesService) {
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
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id
    // this.getListVolumes()
  }

  getListVolumes() {
    this.volumeService.getVolumes(this.tokenService.get()?.userId, this.project, this.region,
        9999, 1, null, null)
        .subscribe(data => {
          data.records.forEach(item => {
            if(this.nameList.length > 0) {
              this.nameList.push(item.name)
            } else {
              this.nameList = [item.name]
            }
          })
        }, error => {
          this.nameList = []
        })
  }

  submitForm() {
    this.nameList = []
  }

  goBack(): void {
    this.router.navigate(['/app-smart-cloud/volume/detail/' + this.volumeId])
  }

  ngOnInit() {

    this.volumeId = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    if(this.volumeId != undefined || this.volumeId != null) {
      this.getVolumeById(this.volumeId)

    }

    // const idVolume = this.activatedRoute.snapshot.paramMap.get('id');
    // this.getVolumeById(idVolume);
    //
    //
    // let userId = this.tokenService.get()?.userId;
    // this.getAllVmResponse =  this.volumeSevice.getListVM(userId, this.regionIdSearch);
    // this.listAllVMs = this.getAllVmResponse.records;
    // this.listAllVMs.forEach((vm) => {
    //   this.vmList.push({value: vm.id, label: vm.name});
    // })

  }

  instance: InstancesModel = new InstancesModel()

  getInstanceById(id) {
    this.instanceService.getInstanceById(id).subscribe(data => {
      this.instance = data
    })
  }

   getVolumeById(idVolume: number) {
    this.volumeService.getVolummeById(idVolume).subscribe(data => {
      if (data !== undefined && data != null) {
        this.volumeInfo = data;
        this.oldSize = data.sizeInGB;
        this.validateForm.controls.storage.setValue(data.sizeInGB)
        this.validateForm.controls.description.setValue(data.description)
        if(this.volumeInfo?.instanceId != null) {
          this.getInstanceById(this.volumeInfo?.instanceId)
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
  //
  changeVolumeType() {
    this.notification.warning('', 'Không thể thay đổi loại Volume.')
  }
  //
  // getProjectId(projectId: number) {
  //   this.projectIdSearch = projectId;
  // }
  //
  // async getRegionId(regionId: number) {
  //   this.regionIdSearch = regionId;
  //
  //   this.vmList = [];
  //   let userId = this.tokenService.get()?.userId;
  //   this.getAllVmResponse = await this.volumeSevice.getListVM(userId, this.regionIdSearch).toPromise();
  //   this.listAllVMs = this.getAllVmResponse.records;
  //   this.listAllVMs.forEach((vm) => {
  //     this.vmList.push({value: vm.id, label: vm.name});
  //   })
  // }
  //
  // editVolume() {
  //   if (this.oldSize !== this.volumeInfo.sizeInGB) {
  //     console.log('Call API Create.')
  //     this.doEditSizeVolume();
  //   } else {
  //     console.log('Call API PUT')
  //     this.doEditTextVolume();
  //   }
  // }
  //
  // async doEditTextVolume() {
  //   let request = new EditTextVolumeModel();
  //   request.volumeId = this.volumeInfo.id;
  //   request.newDescription = this.volumeInfo.description;
  //   request.newName = this.volumeInfo.name;
  //   let response = this.volumeSevice.editTextVolume(request).toPromise();
  //   if (await response == true) {
  //     this.nzMessage.create('success', 'Chỉnh sửa thông tin Volume thành công.');
  //     this.router.navigate(['/app-smart-cloud/volume']);
  //   } else
  //     return false;
  //
  // }
  //
  // private doEditSizeVolume() {
  //   let editVolumeDto = new EditSizeMemoryVolumeDTO();
  //   editVolumeDto.serviceInstanceId = this.volumeInfo.id;
  //   editVolumeDto.newDescription = this.volumeInfo.description;
  //   editVolumeDto.regionId = this.volumeInfo.regionId;
  //   editVolumeDto.newSize = this.volumeInfo.sizeInGB
  //   editVolumeDto.newOfferId = 0;
  //   editVolumeDto.serviceName = this.volumeInfo.name;
  //   editVolumeDto.vpcId = this.volumeInfo.vpcId;
  //   editVolumeDto.customerId = this.tokenService.get()?.userId;
  //   editVolumeDto.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null";
  //   const userString = localStorage.getItem('user');
  //   const user = JSON.parse(userString);
  //   editVolumeDto.actorEmail = user.email;
  //   editVolumeDto.userEmail = user.email;
  //   editVolumeDto.serviceType = 2;
  //   editVolumeDto.actionType = 1;
  //
  //   let request = new EditSizeVolumeModel();
  //   request.customerId = editVolumeDto.customerId;
  //   request.createdByUserId = editVolumeDto.customerId;
  //   request.note = 'update volume';
  //   request.orderItems = [
  //     {
  //       orderItemQuantity: 1,
  //       specification: JSON.stringify(editVolumeDto),
  //       specificationType: 'volume_resize',
  //       price: this.priceVolumeInfo.price,
  //       serviceDuration: this.expiryTime
  //     }
  //   ]
  //   let reponse = this.volumeSevice.editSizeVolume(request).subscribe(data => {
  //       if (data != null) {
  //         this.nzMessage.create('success', 'Chỉnh sửa Volume thành công.')
  //         console.log(data);
  //         this.router.navigate(['/app-smart-cloud/volume']);
  //       }
  //     }
  //   );
  //
  // }
  //
  // getPremiumVolume(size: number) {
  //
  //   if (size !== undefined && size != null) {
  //
  //
  //     this.volumeSevice.getPremium(this.volumeInfo.volumeType, size, this.expiryTime).subscribe(data => {
  //       if (data != null) {
  //         this.nzMessage.create('success', 'Phí đã được cập nhật.')
  //         this.priceVolumeInfo = data;
  //       }
  //     })
  //   }
  // }


}
