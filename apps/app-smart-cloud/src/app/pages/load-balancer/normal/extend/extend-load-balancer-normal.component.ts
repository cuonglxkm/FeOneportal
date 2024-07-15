import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { FormExtendLoadBalancer, LoadBalancerModel } from '../../../../shared/models/load-balancer.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DataPayment, ItemPayment } from '../../../instances/instances.model';
import { OrderItem } from '../../../../shared/models/price';
import { EditSizeVolumeModel } from '../../../../shared/models/volume.model';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';
import { OrderService } from '../../../../shared/services/order.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { fi } from 'date-fns/locale';
import { finalize } from 'rxjs/operators';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-extend-load-balancer-normal',
  templateUrl: './extend-load-balancer-normal.component.html',
  styleUrls: ['./extend-load-balancer-normal.component.less'],
})
export class ExtendLoadBalancerNormalComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  loadBalancerId: number;
  loadBalancer: LoadBalancerModel = new LoadBalancerModel();

  validateForm: FormGroup<{
    time: FormControl<number>
  }> = this.fb.group({
    time: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });

  formExtendLoadBalancer: FormExtendLoadBalancer = new FormExtendLoadBalancer();
  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;
  estimateExpireDate: Date = null;
  loadingCaCulate = true;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private loadBalancerService: LoadBalancerService,
              private orderService : OrderService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder) {
    this.validateForm.get('time').valueChanges.subscribe((newValue: any) => {
      this.getTotalAmount();
    });
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/load-balancer/list']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/load-balancer/list']);
  }

  loadBalancerInit() {
    this.formExtendLoadBalancer.regionId = this.region
    this.formExtendLoadBalancer.serviceName = this.loadBalancer?.name
    this.formExtendLoadBalancer.customerId = this.loadBalancer?.customerId
    this.formExtendLoadBalancer.projectId = this.project
    this.formExtendLoadBalancer.vpcId = this.project
    this.formExtendLoadBalancer.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.LoadBalancerExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null"
    this.formExtendLoadBalancer.serviceType = 15
    this.formExtendLoadBalancer.actionType = 3
    this.formExtendLoadBalancer.serviceInstanceId = this.loadBalancer?.id
    this.formExtendLoadBalancer.actorEmail = this.tokenService.get()?.email
    this.formExtendLoadBalancer.userEmail = this.tokenService.get()?.email
  }

  getTotalAmount() {
    this.loadingCaCulate = true;
    this.loadBalancerInit();
    console.log(this.formExtendLoadBalancer)
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formExtendLoadBalancer);
    itemPayment.specificationType = 'loadbalancer_extend';
    itemPayment.sortItem = 0;
    itemPayment.serviceDuration = this.validateForm.get('time').value;

    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.loadBalancerService.totalAmount(dataPayment)
      .pipe(finalize(()=>{this.loadingCaCulate = false;}))
      .subscribe((result) => {
      this.orderItem = result.data;
      this.unitPrice = this.orderItem?.orderItemPrices[0].unitPrice.amount;
      this.estimateExpireDate = this.orderItem?.orderItemPrices[0].expiredDate;
    });
  }


  getLoadBalancer() {
    this.loadBalancerService.getLoadBalancerById(this.loadBalancerId, true).subscribe(data => {
      this.loadBalancer = data

      this.getTotalAmount();
    })
  }

  navigateToPaymentSummary() {
    if (this.validateForm.valid) {
      this.getTotalAmount();
      let request = new EditSizeVolumeModel();
      request.customerId = this.formExtendLoadBalancer.customerId;
      request.createdByUserId = this.formExtendLoadBalancer.customerId;
      request.note = 'Gia hạn Load Balancer';
      request.orderItems = [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(this.formExtendLoadBalancer),
          specificationType: 'loadbalancer_extend',
          price: this.orderItem?.totalAmount?.amount,
          serviceDuration: this.validateForm.controls.time.value
        }
      ];
      var returnPath: string = '/app-smart-cloud/load-balancer/extend/normal/' + this.loadBalancerId
      console.log('request', request)
      this.orderService.validaterOrder(request).subscribe(
        data => {
          if (data.success) {
            this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: request, path: returnPath}});
          } else {
            this.isVisiblePopupError = true;
            this.errorList = data.data;
          }
        },
        error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'),this.i18n.fanyi('app.validate.order.fail'))
        }
      )

    }
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.loadBalancerId = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getLoadBalancer();

  }

  onChangeTime($event: any) {
    this.validateForm.controls['time'].setValue($event);
    this.getTotalAmount();
  }
}
