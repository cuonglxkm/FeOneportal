import {Component, Inject, OnInit, ViewChildren} from '@angular/core';
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

@Component({
  selector: 'app-create-volume',
  templateUrl: './create-volume.component.html',
  styleUrls: ['./create-volume.component.less'],
})
export class CreateVolumeComponent implements OnInit {

  isLoadingAction = false;
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
  protected readonly onchange = onchange;

  //Phi Volume
  priceVolumeInfo: PriceVolumeDto = {
    price: 0,
    totalPrice: 0,
    tax: 0
  };

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private volumeSevice: VolumeService,
              private snapshotvlService: SnapshotVolumeService, private activatedRoute: ActivatedRoute,
              private nzMessage: NzMessageService, private router: Router) {
  }

  async ngOnInit(): Promise<void> {
    this.activatedRoute.queryParams.subscribe(params => {
      console.log(params);
      const createdFromSnapshot = params['createdFromSnapshot'];
      const idSnapshot = params['idSnapshot'];
      const sizeSnapshot = params['sizeSnapshot'];
      const typeSnapshot = params['typeSnapshot'];

      if (createdFromSnapshot == 'true') {
        this.isInitSnapshot = true;
        this.createVolumeInfo.createFromSnapshotId = Number.parseInt(idSnapshot);
        this.createVolumeInfo.volumeSize = Number.parseInt(sizeSnapshot);
        this.createVolumeInfo.volumeType = typeSnapshot;
      }

    });

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
  checkDisableCreate(): boolean{
    return this.createVolumeInfo.serviceName == null || this.createVolumeInfo.volumeType == null || this.createVolumeInfo.expireDate == null;
  }

  createNewVolume() {

    if (this.validateData()) {

      this.createVolumeInfo.customerId = this.tokenService.get()?.userId;
      const userString = localStorage.getItem('user');
      const user = JSON.parse(userString);
      this.createVolumeInfo.actorEmail = user.email;
      this.createVolumeInfo.userEmail = user.email;
      if (this.createVolumeInfo.volumeType == 'hdd') {
        this.createVolumeInfo.offerId = 2;
      }
      if (this.createVolumeInfo.volumeType == 'ssd') {
        this.createVolumeInfo.offerId = 156;
      }
      this.doCreateVolume();
      console.log(this.createVolumeInfo);
    } else {

    }
  }

  doCreateVolume() {
    this.isLoadingAction = true;
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
      if (data != null) {
        this.isLoadingAction = false;
        this.nzMessage.create('success', 'Tạo Volume thành công.')
        console.log(data);
        this.router.navigate(['/app-smart-cloud/volume']);
      }else{
        this.isLoadingAction = false;
      }
    },
      error => {
        this.isLoadingAction = false;
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
    if (!this.createVolumeInfo.regionId) {
      this.nzMessage.create('error', 'Cần chọn khu vực.');
      return false;
    }
    if (!this.createVolumeInfo.vpcId) {
      this.nzMessage.create('error', 'Cần chọn dự án.');
      return false;
    }

    return true;
  }

  changeVolumeName() {
    this.createVolumeInfo.serviceName = this.createVolumeInfo.serviceName.trim();
    if(this.checkSpecialSnapshotName(this.createVolumeInfo.serviceName)){
      this.showWarningVolumeName = true;
      this.contentShowWarningVolumeName = 'Tên Volume không được chứa ký tự đặc biệt.';
    }else if(this.createVolumeInfo.serviceName === null || this.createVolumeInfo.serviceName == ''){
      this.showWarningVolumeName = true;
      this.contentShowWarningVolumeName = 'Tên Volume không được để trống';
    }else{
      this.showWarningVolumeName = false;
      this.contentShowWarningVolumeName = '';
    }

  }


  checkSpecialSnapshotName( str: string): boolean{
    //check ký tự đặc biệt
    const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialCharacters.test(str);
  }

  loadSnapshotVolumeInfo(event: any) {
    this.isLoadingAction = true
    this.snapshotvlService.getSnapshotVolummeById(event).subscribe(
      (data) => {

        this.createVolumeInfo.volumeSize = data.sizeInGB;
        this.createVolumeInfo.createFromSnapshotId = Number.parseInt(event);
        this.createVolumeInfo.volumeType = data.iops > 0 ? 'hdd' : 'ssd';
        this.isLoadingAction = false;
      },
      (error) => {
        this.nzMessage.create('error', 'Lấy thông tin snapshot không thành công.')
        this.isLoadingAction = false;
      }
  )
  }

  getProjectId(project: ProjectModel) {
    this.createVolumeInfo.vpcId = project.id;
    this.getListSnapshot();
  }

  async getRegionId(region: RegionModel) {
    this.createVolumeInfo.regionId = region.regionId;
    this.getListSnapshot()
    this.getListVm()
  }

  selectEncryptionVolume(value: any) {
    if (value) {
      this.createVolumeInfo.isMultiAttach = !value;
    }

  }

  selectMultiAttachVolume(value: any) {
    if (value) {
      this.createVolumeInfo.isEncryption = !value;
    }
  }

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

  private getListVm() {
    this.isLoadingAction = true;
    this.vmList = [];
    let userId = this.tokenService.get()?.userId;
    this.volumeSevice.getListVM(userId, this.createVolumeInfo.regionId).subscribe(data => {
      data.records.forEach(vm => {
        this.vmList.push({value: vm.id, label: vm.name});
      });
      this.isLoadingAction = false;
    });
  }

}
