import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {CreateVolumeRequestModel, GetAllVmModel} from "../../../../shared/models/volume.model";
import {CreateVolumeDto, PriceVolumeDto, VmDto} from "../../../../shared/dto/volume.dto";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {InstancesModel, VolumeCreate} from "../../../instances/instances.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {VolumeService} from "../../../../shared/services/volume.service";
import {SnapshotVolumeService} from "../../../../shared/services/snapshot-volume.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {InstancesService} from "../../../instances/instances.service";
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {OrderItem} from "../../../../shared/models/price";

@Component({
  selector: 'one-portal-create-volume-vpc',
  templateUrl: './create-volume-vpc.component.html',
  styleUrls: ['./create-volume-vpc.component.less'],
})
export class CreateVolumeVpcComponent implements OnInit{
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

  selectedValueRadio = 'hdd';

  validateForm: FormGroup<{
    name: FormControl<string>
    isSnapshot: FormControl<boolean>
    snapshot: FormControl<number>
    radio: FormControl<any>
    instanceId: FormControl<number>
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

  orderItem: OrderItem = new OrderItem()
  unitPrice = 0

  isVisibleCreate: boolean = false
  isLoadingCreate: boolean = false

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

  ngOnInit() {

    if ([1, 2].includes(this.region)) {
      if (this.validateForm.controls.storage.value < 20) return this.iops = 0
      if (this.validateForm.controls.storage.value <= 200) return this.iops = 600
      if (this.validateForm.controls.storage.value <= 500) return this.iops = 1200
      if (this.validateForm.controls.storage.value <= 1000) return this.iops = 3000
      if (this.validateForm.controls.storage.value <= 2000) return this.iops = 6000
    }
    if ([3, 4].includes(this.region)) {
      if (this.validateForm.controls.storage.value < 40) return this.iops = 400
      this.iops = this.validateForm.controls.storage.value * 10
    }

    this.getListInstance()
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

  // regionChanged(region: RegionModel) {
  //   this.region = region.regionId
  //   this.validateForm.get('storage').reset()
  // }
  //
  // projectChanged(project: ProjectModel) {
  //   this.project = project.id
  //   this.getListInstance()
  // }

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

  instanceSelectedChange(value: any) {
    this.instanceSelected = value
  }

  showConfirmCreate() {
    this.isVisibleCreate = true
  }

  handleCancelCreate() {
    this.isVisibleCreate = false
    this.isLoadingCreate = false
  }

  handleOkCreate() {
    this.doCreateVolumeVPC()
  }

  getListInstance() {
    this.instanceService.search(1, 9999, this.region, this.project,
      '', '', false, this.tokenService.get()?.userId)
      .subscribe(data => {
        this.listInstances = data.records
        this.cdr.detectChanges()
      })
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

    // let currentDate = new Date();
    // let lastDate = new Date();
    // if(this.timeSelected == undefined || this.timeSelected == null) {
    //   lastDate.setDate(currentDate.getDate() + 30);
    // } else {
    //   lastDate.setDate(currentDate.getDate() + this.timeSelected * 30);
    // }
    // this.volumeCreate.createDate = currentDate?.toISOString().substring(0, 19);
    // this.volumeCreate.expireDate = lastDate?.toISOString().substring(0, 19);

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

  doCreateVolumeVPC(){
    if(this.validateForm.valid) {
      this.volumeInit()
      let request: CreateVolumeRequestModel = new CreateVolumeRequestModel();
      request.customerId = this.volumeCreate.customerId;
      request.createdByUserId = this.volumeCreate.customerId;
      request.note = 'tạo volume';
      request.orderItems = [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(this.volumeCreate),
          specificationType: 'volume_create',
          price: 0,
          serviceDuration: 1
        }
      ]
      console.log(request);
      this.volumeService.createNewVolume(request).subscribe(data => {
          if (data != null) {
            if(data.code == 200){
              this.isLoadingAction = false;
              this.notification.success('Thành công', 'Yêu cầu tạo Volume thành công.')
              this.router.navigate(['/app-smart-cloud/volumes']);
            }
          }else{
            this.isLoadingAction = false;
          }
        },
        error => {
          this.isLoadingAction = false;
        })
    }
  }

  clear() {
    this.validateForm.reset()
  }

}
