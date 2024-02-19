import {ChangeDetectorRef, Component, Inject, OnInit, ViewChildren} from '@angular/core';
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {GetAllVmModel} from "../../../../shared/models/volume.model";
import {CreateVolumeDto, PriceVolumeDto, VmDto} from "../../../../shared/dto/volume.dto";
import {VolumeService} from "../../../../shared/services/volume.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {CreateVolumeRequestModel} from "../../../../shared/models/volume.model";
import {HeaderVolumeComponent} from "../header-volume/header-volume.component";
import {ActivatedRoute, Router} from "@angular/router";
import {SnapshotVolumeService} from "../../../../shared/services/snapshot-volume.service";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {InstancesService} from "../../../instances/instances.service";
import {DataPayment, InstancesModel, ItemPayment, VolumeCreate} from "../../../instances/instances.model";
import { OrderItem } from 'src/app/shared/models/price';
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-create-volume',
  templateUrl: './create-volume.component.html',
  styleUrls: ['./create-volume.component.less'],
})
export class CreateVolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoadingAction = false;
  getAllVmResponse: GetAllVmModel;
  listAllVMs: VmDto[] = [];

  volumeName = '';
  vmList: NzSelectOptionInterface[] = [];
  expiryTimeList = [
    {label: '1', value: '1'},
    {label: '3', value: '3'},
    {label: '6', value: '6'},
    {label: '9', value: '9'},
    {label: '12', value: '12'},
    {label: '24', value: '24'},
  ];
  snapshotList: NzSelectOptionInterface[] = [];

  createDateVolume: Date = new Date();
  endDateVolume: Date;

  showWarningVolumeName = false;
  contentShowWarningVolumeName: string;
  showWarningVolumeType = false;
  showWarningVolumeExpTime = false;


  createVolumeInfo: CreateVolumeDto = {
    volumeType: "",
    volumeSize: 1,
    description: '',
    instanceToAttachId: null,
    isMultiAttach: false,
    isEncryption: false,
    vpcId: null,
    oneSMEAddonId: null,
    serviceType: 2,
    serviceInstanceId: 0, //ID Volume
    customerId: null,
    createDate: null,
    expireDate: null,
    saleDept: null,
    saleDeptCode: null,
    contactPersonEmail: null,
    contactPersonPhone: null,
    contactPersonName: null,
    note: null,
    createDateInContract: null,
    am: null,
    amManager: null,
    isTrial: false,
    offerId: null,
    couponCode: null,
    dhsxkd_SubscriptionId: null,
    dSubscriptionNumber: null,
    dSubscriptionType: null,
    oneSME_SubscriptionId: null,
    actionType: 1,
    regionId: null,
    serviceName: null,
    typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
    userEmail: null,
    actorEmail: null,
    createFromSnapshotId: null,
  };
  volumeExpiryTime: number;

  volumeStorage = 1;
  isEncode = false;
  isAddVms = false;
  isInitSnapshot = false;
  snapshot: any;
  mota = '';


  //Phi Volume
  priceVolumeInfo: PriceVolumeDto = {
    price: 0,
    totalPrice: 0,
    tax: 0
  };

  selectedValueRadio = 'hdd';

  validateForm: FormGroup<{
    name: FormControl<string>
    isSnapshot: FormControl<boolean>
    snapshot: FormControl<number>
    radio: FormControl<any>
    instanceId: FormControl<number>
    time: FormControl<number>
    description: FormControl<string>
    storage: FormControl<number>
    isEncryption: FormControl<boolean>
    isMultiAttach: FormControl<boolean>
  }> = this.fb.group({
    name: ['',[Validators.required, Validators.pattern(/^[a-zA-Z0-9\s]+$/), this.duplicateNameValidator.bind(this)]],
    isSnapshot: [false, []],
    snapshot: [null as number , []],
    radio: [''],
    instanceId: [null as number],
    time: [1, Validators.required],
    description: ['', Validators.maxLength(700)],
    storage: [1, Validators.required],
    isEncryption: [false],
    isMultiAttach: [false],
  });

  snapshotSelected: number

  multipleVolume: boolean = false;

  listInstances: InstancesModel[]

  instanceSelected: number

  timeSelected: any

  date: Date

  iops: number

  nameList: string[] = []

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private volumeService: VolumeService,
              private snapshotvlService: SnapshotVolumeService,
              private route: ActivatedRoute,
              private notification: NzNotificationService,
              private router: Router,
              private fb: NonNullableFormBuilder,
              private instanceService: InstancesService,
              private cdr: ChangeDetectorRef) {

    this.validateForm.get('isMultiAttach').valueChanges.subscribe((value) => {
      this.multipleVolume = value
      this.validateForm.get('instanceId').reset()
    });

    this.validateForm.get('storage').valueChanges.subscribe((value) => {
      if ([1, 2].includes(this.region)) {
        if (value < 20) return this.iops = 0
        if (value <= 200) return this.iops = 600
        if (value <= 500) return this.iops = 1200
        if (value <= 1000) return this.iops = 3000
        if (value <= 2000) return this.iops = 6000
      }
      if ([3, 4].includes(this.region)) {
        if (value < 40) return this.iops = 400
        this.iops = value * 10
      }
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
          this.nameList = null
        })
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.validateForm.get('storage').reset()
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id
    this.getListSnapshot()
    this.getListInstance()
    this.getListVolumes()
  }

  onSwitchSnapshot(){
    this.isInitSnapshot = this.validateForm.controls.isSnapshot.value
    console.log('snap shot', this.isInitSnapshot)
  }

  snapshotSelectedChange(value: number){
    this.snapshotSelected = value
  }

  onChangeStatus() {
    console.log('Selected option changed:', this.selectedValueRadio);
  }

  //get danh sách máy ảo
  getListInstance() {
    this.instanceService.search(1, 9999, this.region, this.project,
        '', '', false, this.tokenService.get()?.userId)
        .subscribe(data => {
          this.listInstances = data.records
          this.cdr.detectChanges()
        })
  }

  instanceSelectedChange(value: any) {
    this.instanceSelected = value
  }

  timeSelectedChange(value) {
    this.timeSelected = value
    console.log(this.timeSelected)
    this.getTotalAmount()
  }

  goBack(): void {
    this.router.navigate(['/app-smart-cloud/volumes'])
  }

  volumeCreate: VolumeCreate = new VolumeCreate();

  volumeInit() {
    this.volumeCreate.volumeType = this.selectedValueRadio;
    this.volumeCreate.volumeSize = this.validateForm.get('storage').value;
    this.volumeCreate.description = this.validateForm.get('description').value;
    if(this.validateForm.controls.isSnapshot.value == true) {
      this.volumeCreate.createFromSnapshotId = this.validateForm.controls.snapshot.value;
    } else {
      this.volumeCreate.createFromSnapshotId = null
    }

    this.volumeCreate.instanceToAttachId = this.validateForm.controls.instanceId.value;
    this.volumeCreate.isMultiAttach = this.validateForm.controls.isMultiAttach.value;
    this.volumeCreate.isEncryption = this.validateForm.controls.isEncryption.value;
    this.volumeCreate.vpcId = this.project.toString();
    this.volumeCreate.oneSMEAddonId = null;
    this.volumeCreate.serviceType = 2;
    this.volumeCreate.serviceInstanceId = 0;
    this.volumeCreate.customerId = this.tokenService.get()?.userId;
    this.volumeCreate.iops = this.iops

    let currentDate = new Date();
    let lastDate = new Date();
    if(this.timeSelected == undefined || this.timeSelected == null) {
      lastDate.setDate(currentDate.getDate() + 30);
    } else {
      lastDate.setDate(currentDate.getDate() + this.timeSelected * 30);
    }
    this.volumeCreate.createDate = currentDate?.toISOString().substring(0, 19);
    this.volumeCreate.expireDate = lastDate?.toISOString().substring(0, 19);

    this.volumeCreate.saleDept = null;
    this.volumeCreate.saleDeptCode = null;
    this.volumeCreate.contactPersonEmail = null;
    this.volumeCreate.contactPersonPhone = null;
    this.volumeCreate.contactPersonName = null;
    this.volumeCreate.note = null;
    this.volumeCreate.createDateInContract = null;
    this.volumeCreate.am = null;
    this.volumeCreate.amManager = null;
    this.volumeCreate.isTrial = false;
    // this.volumeCreate.offerId =
    //     this.volumeCreate.volumeType == 'hdd' ? 2 : 156;
    this.volumeCreate.couponCode = null;
    this.volumeCreate.dhsxkd_SubscriptionId = null;
    this.volumeCreate.dSubscriptionNumber = null;
    this.volumeCreate.dSubscriptionType = null;
    this.volumeCreate.oneSME_SubscriptionId = null;
    this.volumeCreate.actionType = 0;
    this.volumeCreate.regionId = this.region;
    this.volumeCreate.serviceName = this.validateForm.controls.name.value ;
    this.volumeCreate.typeName =
        'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null';
    this.volumeCreate.userEmail = this.tokenService.get()?.email;
    this.volumeCreate.actorEmail = this.tokenService.get()?.email;
  }

  totalAmountVolume = 0;
  totalAmountVolumeVAT = 0;
  orderItem: OrderItem = new OrderItem()
  unitPrice = 0

  changeValueInput() {
    this.iops = 0
    console.log('total amount')
    this.getTotalAmount()
  }

  getTotalAmount() {
    this.volumeInit()

    console.log('time', this.timeSelected)
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.volumeCreate);
    itemPayment.specificationType = 'volume_create';
    itemPayment.serviceDuration = this.validateForm.get('time').value;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien volume', result.data);
      this.orderItem = result.data
      this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount

    });
  }

  ngOnInit() {
    this.date = new Date()
  }

  submitForm() {
    this.nameList = []
    if(this.validateForm.valid) {
      console.log(this.validateForm.value);
      this.doCreateVolume()
    } else {
      this.notification.warning('', 'Vui lòng nhập đầy đủ thông tin')
    }
  }

  //
  doCreateVolume() {
    this.isLoadingAction = true;
    this.getTotalAmount()
    let request: CreateVolumeRequestModel = new CreateVolumeRequestModel();
    request.customerId = this.volumeCreate.customerId;
    request.createdByUserId = this.volumeCreate.customerId;
    request.note = 'tạo volume';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.volumeCreate),
        specificationType: 'volume_create',
        price: this.orderItem?.totalPayment?.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ]

    console.log(request);
    this.volumeService.createNewVolume(request).subscribe(data => {
      if (data != null) {
        //Case du tien trong tai khoan => thanh toan thanh cong : Code = 200
        if(data.code == 200){
          this.isLoadingAction = false;
          this.notification.success('Thành công', 'Yêu cầu tạo Volume thành công.')
          this.router.navigate(['/app-smart-cloud/volumes']);
        }
        //Case ko du tien trong tai khoan => chuyen sang trang thanh toan VNPTPay : Code = 310
        else if(data.code == 310){
          this.isLoadingAction = false;
          // this.router.navigate([data.data]);
          window.location.href = data.data;
        }
      }else{
        this.isLoadingAction = false;
      }
    },
      error => {
        this.isLoadingAction = false;
      })
  }
  //
  //
  // validateData(): boolean {
  //   if (!this.createVolumeInfo.serviceName) {
  //     this.nzMessage.create('error', 'Tên Volume không được để trống.');
  //     this.showWarningVolumeName = true;
  //     return false;
  //   }
  //   if (!this.createVolumeInfo.volumeType) {
  //     this.nzMessage.create('error', 'Cần chọn loại Volume.');
  //     this.showWarningVolumeType = true;
  //     return false;
  //   }
  //   if (!this.volumeExpiryTime) {
  //     this.nzMessage.create('error', 'Cần chọn thời gian sử dụng.');
  //     this.showWarningVolumeExpTime = true;
  //     return false;
  //   }
  //   if (!this.createVolumeInfo.regionId) {
  //     this.nzMessage.create('error', 'Cần chọn khu vực.');
  //     return false;
  //   }
  //   if (!this.createVolumeInfo.vpcId) {
  //     this.nzMessage.create('error', 'Cần chọn dự án.');
  //     return false;
  //   }
  //
  //   return true;
  // }
  //
  // changeVolumeName() {
  //   this.createVolumeInfo.serviceName = this.createVolumeInfo.serviceName.trim();
  //   if(this.checkSpecialSnapshotName(this.createVolumeInfo.serviceName)){
  //     this.showWarningVolumeName = true;
  //     this.contentShowWarningVolumeName = 'Tên Volume không được chứa ký tự đặc biệt.';
  //   }else if(this.createVolumeInfo.serviceName === null || this.createVolumeInfo.serviceName == ''){
  //     this.showWarningVolumeName = true;
  //     this.contentShowWarningVolumeName = 'Tên Volume không được để trống';
  //   }else{
  //     this.showWarningVolumeName = false;
  //     this.contentShowWarningVolumeName = '';
  //   }
  //
  // }
  //
  // checkSpecialSnapshotName( str: string): boolean{
  //   //check ký tự đặc biệt
  //   const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  //   return specialCharacters.test(str);
  // }
  //
  // loadSnapshotVolumeInfo(event: any) {
  //   this.isLoadingAction = true
  //   this.snapshotvlService.getSnapshotVolumeById(event).subscribe(
  //     (data) => {
  //       this.createVolumeInfo.volumeSize = data.sizeInGB;
  //       this.createVolumeInfo.createFromSnapshotId = Number.parseInt(event);
  //       this.createVolumeInfo.volumeType = data.iops > 0 ? 'hdd' : 'ssd';
  //       this.isLoadingAction = false;
  //     })
  // }
  //
  // getProjectId(project: ProjectModel) {
  //   this.createVolumeInfo.vpcId = project.id;
  //   this.getListSnapshot();
  // }
  //
  // async getRegionId(region: RegionModel) {
  //   this.createVolumeInfo.regionId = region.regionId;
  //   this.getListSnapshot()
  //   this.getListVm()
  // }
  //
  // selectEncryptionVolume(value: any) {
  //   if (value) {
  //     this.createVolumeInfo.isMultiAttach = !value;
  //   }
  //
  // }
  //
  // selectMultiAttachVolume(value: any) {
  //   if (value) {
  //     this.createVolumeInfo.isEncryption = !value;
  //   }
  // }
  //
  private getListSnapshot() {
    this.isLoadingAction = true;
    this.snapshotList = [];
    let userId = this.tokenService.get()?.userId;
    this.snapshotvlService.getSnapshotVolumes(userId, this.createVolumeInfo.vpcId, this.createVolumeInfo.regionId,
      null, 10000, 1, null, null, null).subscribe(data => {
      data.records.forEach(snapshot => {
        this.snapshotList.push({label: snapshot.name, value: snapshot.id});
      })
      this.isLoadingAction = false;
    });
  }

}
