import {Component, Inject, OnInit, ViewChildren} from '@angular/core';
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {GetAllVmModel} from "../../../../shared/models/volume.model";
import {CreateVolumeDto, PriceVolumeDto, VmDto} from "../../../../shared/dto/volume.dto";
import {VolumeService} from "../../../../shared/services/volume.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {CreateVolumeRequestModel} from "../../../../shared/models/volume.model";
import {HeaderVolumeComponent} from "../header-volume/header-volume.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-create-volume',
  templateUrl: './create-volume.component.html',
  styleUrls: ['./create-volume.component.less'],
})
export class CreateVolumeComponent implements OnInit {

  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Volume',
    content: 'Tạo Volume '
  };

  getAllVmResponse: GetAllVmModel;
  listAllVMs: VmDto[] = [];

  volumeName = '';
  vmList: NzSelectOptionInterface[] = [];
  expiryTimeList: NzSelectOptionInterface[] = [
    {label: '1', value: 1},
    {label: '3', value: 3},
    {label: '6', value: 6},
    {label: '9', value: 9},
    {label: '12', value: 12},
    {label: '24', value: 24},
  ];
  snapshotList: NzSelectOptionInterface[] = [
    {label: 'snapshot_01', value: 100001},
    {label: 'snapshot_02', value: 100002},
    {label: 'snapshot_03', value: 100003},
  ];

  createDateVolume: Date = new Date();
  endDateVolume: Date;

  showWarningVolumeName = false;
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
  protected readonly onchange = onchange;

  //Phi Volume
  priceVolumeInfo: PriceVolumeDto = {
    price: 0,
    totalPrice: 0,
    tax: 0
  };

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private volumeSevice: VolumeService,
              private nzMessage: NzMessageService, private router: Router) {
  }

  async ngOnInit(): Promise<void> {

  }

  getPremiumVolume(volumeType: string, size: number, duration: number) {
    this.showWarningVolumeType = false;
    this.showWarningVolumeExpTime = false;

    if (duration !== undefined && duration != null) {
      this.endDateVolume = new Date(this.createDateVolume.getFullYear(), this.createDateVolume.getMonth()
        + this.volumeExpiryTime, this.createDateVolume.getDate());
      this.createVolumeInfo.createDate = this.createDateVolume.toISOString()
      this.createVolumeInfo.expireDate = this.endDateVolume.toISOString();
      if (volumeType !== undefined && volumeType != null && volumeType != ''
        && size !== undefined && size != null) {


        this.volumeSevice.getPremium(volumeType, size, duration).subscribe(data => {
          if (data != null) {
            this.nzMessage.create('success', 'Phí đã được cập nhật.')
            this.priceVolumeInfo = data;
          }
        })
      }
    }


  }

  createNewVolume() {

    if (this.validateData()) {

      this.createVolumeInfo.customerId = this.tokenService.get()?.userId;
      const userString = localStorage.getItem('user');
      const user = JSON.parse(userString);
      this.createVolumeInfo.actorEmail = user.email;
      this.createVolumeInfo.userEmail = user.email;
      if(this.createVolumeInfo.volumeType == 'hdd'){
        this.createVolumeInfo.offerId =2;
      }
      if(this.createVolumeInfo.volumeType == 'ssd'){
        this.createVolumeInfo.offerId = 156;
      }
      this.doCreateVolume();
      console.log(this.createVolumeInfo);
    } else {

    }
  }

  doCreateVolume(){
    let request: CreateVolumeRequestModel = new CreateVolumeRequestModel();
    request.customerId = this.createVolumeInfo.customerId;
    request.createdByUserId = this.createVolumeInfo.customerId;
    request.note = 'tạo volume';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.createVolumeInfo),
        specificationType: 'volume_create',
        price: this.priceVolumeInfo.price,
        serviceDuration: this.volumeExpiryTime
      }
    ]
    console.log(request);
    this.volumeSevice.createNewVolume(request).subscribe(data => {
      if(data != null){
        this.nzMessage.create('success', 'Tạo Volume thành công.')
        console.log(data);
        this.router.navigate(['/app-smart-cloud/volume']);
      }
    })
    // this.router.navigate(['/app-smart-cloud/volume']);
  }


  validateData(): boolean {

    if (!this.createVolumeInfo.serviceName) {
      this.nzMessage.create('error', 'Tên Volume không được để trống.');
      this.showWarningVolumeName = true;
      return false;
    }
    if (!this.createVolumeInfo.volumeType) {
      this.nzMessage.create('error', 'Cần chọn loại Volume.');
      this.showWarningVolumeType = true;
      return false;
    }
    if (!this.volumeExpiryTime) {
      this.nzMessage.create('error', 'Cần chọn thời gian sử dụng.');
      this.showWarningVolumeExpTime = true;
      return false;
    }
    if(!this.createVolumeInfo.regionId){
      this.nzMessage.create('error', 'Cần chọn khu vực.');
      return false;
    }
    if(!this.createVolumeInfo.vpcId){
      this.nzMessage.create('error', 'Cần chọn dự án.');
      return false;
    }

    return true;
  }

  changeVolumeName() {
    this.showWarningVolumeName = false;
  }


  getProjectId(projectId: number){
    this.createVolumeInfo.vpcId = projectId;

  }

  async getRegionId(regionId: number){

    this.vmList = [];
    this.createVolumeInfo.regionId = regionId;
    this.getAllVmResponse = await this.volumeSevice.getAllVMs(this.createVolumeInfo.regionId).toPromise();
    this.listAllVMs = this.getAllVmResponse.records;
    this.listAllVMs.forEach((vm) => {
      this.vmList.push({value: vm.id, label: vm.name});
    })
  }

  selectEncryptionVolume(value: any){
    if(value){
      this.createVolumeInfo.isMultiAttach = !value;
    }

  }

  selectMultiAttachVolume(value: any){
    if(value){
      this.createVolumeInfo.isEncryption = !value;
    }
  }

}
