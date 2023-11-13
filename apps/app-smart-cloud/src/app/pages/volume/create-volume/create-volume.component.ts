import {Component, OnInit} from '@angular/core';
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {GetAllVmModel} from "../model/get-all-vm.model";
import {VmDto} from "../dto/vm.dto";
import {VolumeService} from "../volume.service";
import {PriceVolumeDto} from "../dto/price-volume.dto";
import {NzMessageService} from "ng-zorro-antd/message";
import {CreateVolumeDto} from "../dto/create-volume.dto";

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

  createVolumeInfo: CreateVolumeDto = {
    volumeType: "",
    volumeSize: 1,
    description: '',
    instanceToAttachId: null,
    isMultiAttach: false,
    isEncryption: false,
    vpcId: null,
    oneSMEAddonId: null,
    serviceType: null,
    serviceInstanceId: null,
    customerId:   null,
    createDate: null,
    expireDate: null,
    saleDept:   null,
    saleDeptCode:   null,
    contactPersonEmail:   null,
    contactPersonPhone:   null,
    contactPersonName:   null,
    note:   null,
    createDateInContract:   null,
    am:   null,
    amManager:  null,
    isTrial:  null,
    offerId: 2,
    couponCode:   null,
    dhsxkd_SubscriptionId:   null,
    dSubscriptionNumber:  null,
    dSubscriptionType:   null,
    oneSME_SubscriptionId:  null,
    actionType:   null,
    regionId:   null,
    serviceName:   null,
    typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
    userEmail:   null,
    actorEmail:   null,
    createFromSnapshotId:   null,
  };
  volumeExpiryTime: any;

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
    tax:0
  };

  constructor(private volumeSevice: VolumeService ,  private nzMessage:NzMessageService) {
  }

  async ngOnInit(): Promise<void> {

    this.getAllVmResponse = await this.volumeSevice.getAllVMs(3).toPromise();
    this.listAllVMs = this.getAllVmResponse.records;
    this.listAllVMs.forEach((vm) => {
      this.vmList.push({value: vm.id ,label: vm.name});
    })

  }

  getPremiumVolume(volumeType: string, size: number, duration: number){
    if(volumeType !== undefined && volumeType != null && size !== undefined && size != null  && duration !== undefined && duration != null ){
      this.volumeSevice.getPremium(volumeType,size,duration).subscribe(data => {
        if(data != null ){
          this.nzMessage.create('success', 'Phí đã được cập nhật.')
          this.priceVolumeInfo = data;
          console.log(data);
        }
      })
    }
  }

  createNewVolume(){
    //TO DO
    console.log(this.createVolumeInfo);
  }



}
