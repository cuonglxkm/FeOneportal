import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {VolumeService} from "../../../../shared/services/volume.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AttachedDto, ExtendVolumeDTO, VolumeDTO} from "../../../../shared/dto/volume.dto";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {OrderItem} from "../../../../shared/models/price";
import {DataPayment, ItemPayment} from "../../../instances/instances.model";
import {InstancesService} from "../../../instances/instances.service";
import {EditSizeVolumeModel} from "../../../../shared/models/volume.model";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-renew-volume',
  templateUrl: './renew-volume.component.html',
  styleUrls: ['./renew-volume.component.less'],
})
export class RenewVolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idVolume: number

  volumeInfo: VolumeDTO = new VolumeDTO()

  attachedDto: AttachedDto[] = [];

  listVMs: string = '';

  volumeStatus: Map<String, string>;

  validateForm: FormGroup<{
    time: FormControl<number>
  }> = this.fb.group({
    time: [1, Validators.required]
  });

  isLoading: boolean = false

  estimateExpireDate: Date = null

  isLoadingRenew: boolean = false
  isVisibleConfirmRenew: boolean = false
  newValue = 0

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private volumeService: VolumeService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private instanceService: InstancesService,
              private notification: NzNotificationService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', 'Đang hoạt động');
    this.volumeStatus.set('ERROR', 'Lỗi');
    this.volumeStatus.set('SUSPENDED', 'Tạm ngừng');

      this.validateForm.get('time').valueChanges.subscribe((newValue: any) => {
        this.getTotalAmount()
      });
  }



  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    // this.getListVolumes()
  }

  navigateEditVolume(idVolume: number) {
    this.router.navigate(['/app-smart-cloud/volume/edit/' + idVolume]);
  }

  getVolumeById(id) {
    this.isLoading = true
    this.volumeService.getVolumeById(id).subscribe(data => {
      this.isLoading = false
      this.volumeInfo = data

      const oldDate = new Date(this.volumeInfo?.expirationDate)
      this.estimateExpireDate = oldDate
      const exp = this.estimateExpireDate.setDate(oldDate.getDate() + 30)
      this.estimateExpireDate = new Date(exp)
      console.log('old', this.volumeInfo?.expirationDate)
      if (data.attachedInstances != null) {
        this.attachedDto = data.attachedInstances;
      }

      if (this.attachedDto.length > 1) {
        this.attachedDto.forEach(vm => {
          this.listVMs += vm.instanceName + '\n';
        })
      }
    }, error => {
      this.isLoading = false
      this.volumeInfo = null
      this.attachedDto = null
      this.listVMs = null
    })
  }



  extendsDto = new ExtendVolumeDTO();

  volumeInit() {
    // console.log(this.estimateExpireDate)
    // this.extendsDto.newExpireDate = this.estimateExpireDate.toISOString()
    this.extendsDto.serviceInstanceId = this.volumeInfo?.id;
    this.extendsDto.regionId = this.volumeInfo?.regionId;
    this.extendsDto.serviceName = this.volumeInfo?.name;
    this.extendsDto.vpcId = this.volumeInfo?.vpcId;
    this.extendsDto.customerId = this.tokenService?.get()?.userId;
    this.extendsDto.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null";
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    this.extendsDto.actorEmail = user.email;
    this.extendsDto.userEmail = user.email;
    this.extendsDto.serviceType = 2;
    this.extendsDto.actionType = 3;
  }

  totalAmountVolume = 0;
  totalAmountVolumeVAT = 0;
  orderItem: OrderItem = new OrderItem()
  unitPrice = 0



  getTotalAmount() {
    this.volumeInit()
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.extendsDto);
    itemPayment.specificationType = 'volume_extend';
    itemPayment.sortItem = 0;
    itemPayment.serviceDuration = this.validateForm.get('time').value
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien volume', result.data);
      this.orderItem = result.data
      this.unitPrice = this.orderItem.orderItemPrices[0].unitPrice.amount
      this.estimateExpireDate = this.orderItem.orderItemPrices[0].expiredDate
    });
  }

  doExtend() {
    // this.volumeInit()
    this.getTotalAmount()
    let request = new EditSizeVolumeModel();
    request.customerId = this.extendsDto.customerId;
    request.createdByUserId = this.extendsDto.customerId;
    request.note = 'extend volume';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.extendsDto),
        specificationType: 'volume_extend',
        price: this.orderItem?.totalPayment?.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ]
    this.isLoadingRenew = true
    this.volumeService.extendsVolume(request).subscribe(
      data => {
        this.isLoadingRenew = false
        this.notification.success('Thành công', 'Gia hạn Volume thành công.')
        this.router.navigate(['/app-smart-cloud/volume/detail/' + this.idVolume])
      }, error => {
        this.isLoadingRenew = false
        this.notification.error('Thất bại', 'Gia hạn Volume không thành công.')

      }
    );
  }

  showModalConfirmRenew() {
    this.isVisibleConfirmRenew = true
  }

  handleCancel() {
    this.isVisibleConfirmRenew = false
  }

  submitForm() {
    if (this.validateForm.valid) {
      this.doExtend()
    }
  }

  handleOk() {
    this.isVisibleConfirmRenew = false
    this.submitForm()
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/volume/detail/' + this.idVolume])
  }

  ngOnInit(): void {
    this.idVolume = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getVolumeById(this.idVolume);


  }


}
