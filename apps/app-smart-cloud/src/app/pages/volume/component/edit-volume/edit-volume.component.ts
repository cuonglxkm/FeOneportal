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
import {DataPayment, InstancesModel, ItemPayment, VolumeCreate} from "../../../instances/instances.model";
import {InstancesService} from "../../../instances/instances.service";
import {OrderItem} from "../../../../shared/models/price";
import {ProjectService} from "../../../../shared/services/project.service";

@Component({
  selector: 'app-edit-volume',
  templateUrl: './edit-volume.component.html',
  styleUrls: ['./edit-volume.component.less'],
})
export class EditVolumeComponent implements OnInit {
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
    name: ['',[Validators.required, Validators.pattern(/^[a-zA-Z0-9\s]+$/), this.duplicateNameValidator.bind(this)]],
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

    this.validateForm.get('storage').valueChanges.subscribe((value) => {
      this.iops = value * 10
    });
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
    // this.router.navigate(['/app-smart-cloud/volumes'])
    // this.getListVolumes()
  }

  userChangeProject(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/volumes'])
    //
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

  showModalConfirmEdit(){
    this.isVisibleConfirmEdit = true
  }

  handleCancel() {
    this.isVisibleConfirmEdit = false

  }

  handleOk() {
    this.submitForm()
    this.isVisibleConfirmEdit = false
  }
  submitForm() {
    console.log(this.validateForm.getRawValue())
    console.log(this.validateForm.valid)
    if(this.validateForm.valid){
      this.nameList = []
      this.doEditSizeVolume()
    }
  }

  navigateToPaymentSummary(){
    if(this.validateForm.valid){
      this.nameList = []
      this.getTotalAmount()
      let request = new EditSizeVolumeModel();
      request.customerId = this.volumeEdit.customerId;
      request.createdByUserId = this.volumeEdit.customerId;
      request.note = 'update volume';
      request.orderItems = [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(this.volumeEdit),
          specificationType: 'volume_resize',
          price: this.orderItem?.totalPayment?.amount,
          serviceDuration: this.expiryTime
        }
      ]
      var returnPath: string = '/app-smart-cloud/volume/edit/'+this.volumeId
      console.log('request', request)
      this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: request, path: returnPath}});
    }
  }

  goBack(): void {
    this.router.navigate(['/app-smart-cloud/volume/detail/' + this.volumeId])
  }

  ngOnInit() {
    this.volumeId = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    if(this.volumeId != undefined || this.volumeId != null) {
      console.log('id', this.volumeId)
      this.getVolumeById(this.volumeId)
      this.getTotalAmountFirst()
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
    this.volumeService.getVolumeById(idVolume).subscribe(data => {
      if (data !== undefined && data != null) {
        this.volumeInfo = data;
        this.oldSize = data.sizeInGB;
        this.validateForm.controls.name.setValue(data.name)
        this.validateForm.controls.storage.setValue(data.sizeInGB)
        this.validateForm.controls.description.setValue(data.description)
        this.selectedValueRadio = data.volumeType
        this.validateForm.controls.radio.setValue(data.volumeType)

        this.iops = this.volumeInfo?.iops

        if(this.volumeInfo?.instanceId != null) {
          this.getInstanceById(this.volumeInfo?.instanceId)
        }
        console.log('volumesInfo', this.volumeInfo.attachedInstances)
        if(data?.attachedInstances != null) {
          this.volumeInfo.attachedInstances?.forEach(item => {
            this.listVMs += item.instanceName.toString() + ', '
          })
        }
        this.getTotalAmount()

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
  changeVolumeType(value) {
    this.selectedValueRadio = value
    // this.notification.warning('', 'Không thể thay đổi loại Volume.')
  }

  volumeEdit: EditSizeMemoryVolumeDTO = new EditSizeMemoryVolumeDTO();
  volumeInit() {
    this.volumeEdit.serviceInstanceId = this.volumeInfo?.id
    this.volumeEdit.newDescription = this.validateForm.controls.description.value
    this.volumeEdit.regionId = this.volumeInfo?.regionId;
    this.volumeEdit.newSize = this.validateForm.controls.storage.value
    this.volumeEdit.iops = this.iops
    // editVolumeDto.newOfferId = 0;
    this.volumeEdit.serviceName = this.validateForm.controls.name.value
    this.volumeEdit.vpcId = this.volumeInfo.vpcId;
    this.volumeEdit.customerId = this.tokenService.get()?.userId;
    this.volumeEdit.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null";
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);1
    this.volumeEdit.actorEmail = user.email;
    this.volumeEdit.userEmail = user.email;
    this.volumeEdit.serviceType = 2;
    this.volumeEdit.actionType = 4; //resize
  }

  totalAmountVolume = 0;
  totalAmountVolumeVAT = 0;
  orderItem: OrderItem = new OrderItem()
  unitPrice = 0

  changeValueInput() {
    console.log('total amount')
    this.getTotalAmount()
  }

  getTotalAmountFirst(){
    const volumeResize = new EditSizeMemoryVolumeDTO();
    volumeResize.serviceInstanceId = this.volumeInfo?.id
    volumeResize.newDescription = this.volumeInfo?.description
    volumeResize.regionId = this.volumeInfo?.regionId;
    volumeResize.newSize = 0
    volumeResize.iops = this.iops
    // editVolumeDto.newOfferId = 0;
    volumeResize.serviceName = this.volumeInfo?.name
    volumeResize.vpcId = this.volumeInfo?.vpcId;
    volumeResize.customerId = this.tokenService.get()?.userId;
    volumeResize.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null";
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    volumeResize.actorEmail = user.email;
    volumeResize.userEmail = user.email;
    volumeResize.serviceType = 2;
    volumeResize.actionType = 4;

    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(volumeResize);
    itemPayment.specificationType = 'volume_resize';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien volume', result.data);
      this.orderItem = result.data
      this.unitPrice = this.orderItem.orderItemPrices[0].unitPrice.amount
    });
  }

  getTotalAmount() {
    this.volumeInit()
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.volumeEdit);
    itemPayment.specificationType = 'volume_resize';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien volume', result.data);
      this.orderItem = result.data
      this.unitPrice = this.orderItem.orderItemPrices[0].unitPrice.amount
    });
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
  doEditSizeVolume() {
    this.getTotalAmount()
    let request = new EditSizeVolumeModel();
    request.customerId = this.volumeEdit.customerId;
    request.createdByUserId = this.volumeEdit.customerId;
    request.note = 'update volume';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.volumeEdit),
        specificationType: 'volume_resize',
        price: this.orderItem?.totalPayment?.amount,
        serviceDuration: this.expiryTime
      }
    ]
    this.isLoading = true
    this.volumeService.editSizeVolume(request).subscribe(data => {
        if (data.code == 200) {
          this.isLoading = false
          this.notification.success('Thành công', 'Chỉnh sửa Volume thành công.')
          console.log(data);
          this.router.navigate(['/app-smart-cloud/volumes']);
        } else if (data.code == 310) {
          this.isLoading = false;
          // this.router.navigate([data.data]);
          window.location.href = data.data;
        } else {
          this.isLoading = false
          this.notification.error('Thất bại', 'Chỉnh sửa Volume thất bại.')
        }
      }
    );

  }
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
