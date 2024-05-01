import { Component, Inject, OnInit } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VolumeService } from '../../../../shared/services/volume.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AttachedDto, ExtendVolumeDTO, VolumeDTO } from '../../../../shared/dto/volume.dto';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { OrderItem } from '../../../../shared/models/price';
import { DataPayment, ItemPayment } from '../../../instances/instances.model';
import { InstancesService } from '../../../instances/instances.service';
import { EditSizeVolumeModel } from '../../../../shared/models/volume.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProjectService, RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-renew-volume',
  templateUrl: './renew-volume.component.html',
  styleUrls: ['./renew-volume.component.less']
})
export class RenewVolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idVolume: number;

  volumeInfo: VolumeDTO = new VolumeDTO();

  attachedDto: AttachedDto[] = [];

  listVMs: string = '';

  volumeStatus: Map<String, string>;

  validateForm: FormGroup<{
    time: FormControl<number>
  }> = this.fb.group({
    time: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });

  isLoading: boolean = false;

  estimateExpireDate: Date = null;

  isLoadingRenew: boolean = false;
  isVisibleConfirmRenew: boolean = false;
  newValue = 0;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private volumeService: VolumeService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private instanceService: InstancesService,
              private notification: NzNotificationService,
              private projectService: ProjectService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', this.i18n.fanyi('app.status.running').toUpperCase());
    this.volumeStatus.set('ERROR', this.i18n.fanyi('app.status.error').toUpperCase());
    this.volumeStatus.set('SUSPENDED', this.i18n.fanyi('app.status.suspend').toUpperCase());

    this.validateForm.get('time').valueChanges.subscribe((newValue: any) => {
      this.getTotalAmount();
    });
  }


  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.router.navigate(['/app-smart-cloud/volumes']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChangeProject(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/volumes']);
  }


  navigateEditVolume(idVolume: number) {
    this.router.navigate(['/app-smart-cloud/volume/edit/' + idVolume]);
  }

  getVolumeById(id) {
    this.isLoading = true;
    this.volumeService.getVolumeById(id).subscribe(data => {
      this.isLoading = false;
      this.volumeInfo = data;

      const oldDate = new Date(this.volumeInfo?.expirationDate);
      this.estimateExpireDate = oldDate;
      const exp = this.estimateExpireDate.setDate(oldDate.getDate() + 30);
      this.estimateExpireDate = new Date(exp);
      console.log('old', this.volumeInfo?.expirationDate);
      if (data.attachedInstances != null) {
        this.volumeInfo.attachedInstances?.forEach(item => {
          this.listVMs += item.instanceName.toString()
        })
        this.getTotalAmount()
      }

    }, error => {
      this.isLoading = false;
      this.volumeInfo = null;
      this.attachedDto = null;
      this.listVMs = null;
    });
  }


  extendsDto = new ExtendVolumeDTO();

  volumeInit() {
    // console.log(this.estimateExpireDate)
    // this.extendsDto.newExpireDate = this.estimateExpireDate.toISOString()
    this.extendsDto.serviceInstanceId = this.volumeInfo?.id;
    this.extendsDto.regionId = this.volumeInfo?.regionId;
    this.extendsDto.serviceName = this.volumeInfo?.name;
    this.extendsDto.projectId = this.volumeInfo?.vpcId;
    this.extendsDto.customerId = this.tokenService?.get()?.userId;
    this.extendsDto.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    this.extendsDto.actorEmail = user.email;
    this.extendsDto.userEmail = user.email;
    this.extendsDto.serviceType = 2;
    this.extendsDto.actionType = 3; //gia hạn
  }

  totalAmountVolume = 0;
  totalAmountVolumeVAT = 0;
  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;


  getTotalAmount() {
    this.volumeInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.extendsDto);
    itemPayment.specificationType = 'volume_extend';
    itemPayment.sortItem = 0;
    itemPayment.serviceDuration = this.validateForm.get('time').value;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien volume', result.data);
      this.orderItem = result.data;
      this.unitPrice = this.orderItem.orderItemPrices[0].unitPrice.amount;
      this.estimateExpireDate = this.orderItem.orderItemPrices[0].expiredDate;
    });
  }

  doExtend() {
    // this.volumeInit()
    this.getTotalAmount();
    let request = new EditSizeVolumeModel();
    request.customerId = this.extendsDto.customerId;
    request.createdByUserId = this.extendsDto.customerId;
    request.note = this.i18n.fanyi('volume.note.extend');
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.extendsDto),
        specificationType: 'volume_extend',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ];
    console.log('request', request)
    console.log('unit', this.orderItem?.orderItemPrices[0]?.unitPrice.amount)
    var returnPath: string = '/app-smart-cloud/volume/detail/'+this.idVolume;
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: request, path: returnPath },
    });
  }

  showModalConfirmRenew() {
    this.isVisibleConfirmRenew = true;
  }

  handleCancel() {
    this.isVisibleConfirmRenew = false;
  }

  submitForm() {
    if (this.validateForm.valid) {
      this.doExtend();
    }
  }

  navigateToPaymentSummary(){
    if (this.validateForm.valid) {
      this.getTotalAmount();
      let request = new EditSizeVolumeModel();
      request.customerId = this.extendsDto.customerId;
      request.createdByUserId = this.extendsDto.customerId;
      request.note =  this.i18n.fanyi('volume.note.extend');
      request.orderItems = [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(this.extendsDto),
          specificationType: 'volume_extend',
          price: this.orderItem?.totalAmount.amount,
          serviceDuration: this.validateForm.controls.time.value
        }
      ];
      var returnPath: string = '/app-smart-cloud/volumes/renew/' + this.idVolume
      console.log('request', request)
      this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: request, path: returnPath}});
    }
  }
  handleOk() {
    this.isVisibleConfirmRenew = false;
    this.submitForm();
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/volume/detail/' + this.idVolume]);
  }


  ngOnInit(): void {
    this.idVolume = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));

    this.getVolumeById(this.idVolume);




  }


}
