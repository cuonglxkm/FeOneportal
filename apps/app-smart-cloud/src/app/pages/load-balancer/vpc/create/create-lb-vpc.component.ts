import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Subnet } from '../../../../shared/models/vlan.model';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { OfferDetail, Product } from '../../../../shared/models/catalog.model';
import { FormCreate, FormCreateLoadBalancer } from '../../../../shared/models/load-balancer.model';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VlanService } from '../../../../shared/services/vlan.service';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectService } from '../../../../shared/services/project.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-create-lb-vpc',
  templateUrl: './create-lb-vpc.component.html',
  styleUrls: ['./create-lb-vpc.component.less']
})
export class CreateLbVpcComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  nameList: string[];
  selectedValueRadio = 'true';
  listSubnets: Subnet[];

  validateForm: FormGroup<{
    name: FormControl<string>
    radio: FormControl<any>
    subnet: FormControl<string>
    ipAddress: FormControl<string>
    ipFloating: FormControl<string>
    offer: FormControl<number>
    description: FormControl<string>
    time: FormControl<number>
  }> = this.fb.group({
    name: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      this.duplicateNameValidator.bind(this), Validators.maxLength(50)]],
    radio: [''],
    subnet: [''],
    ipAddress: ['', Validators.pattern(/^(\d{1,3}\.){3}\d{1,3}$/)],
    ipFloating: [''],
    offer: [1, Validators.required],
    description: ['', Validators.maxLength(255)],
    time: [1, Validators.required]
  });

  product: Product = new Product();
  offerDetail: OfferDetail = new OfferDetail();
  formCreateLoadBalancer: FormCreateLoadBalancer = new FormCreateLoadBalancer();

  productId: number;

  flavorId: string;
  isLoading: boolean = false;

  selectedSubnet: any

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private vlanService: VlanService,
              private catalogService: CatalogService,
              private projectService: ProjectService,
              private loadBalancerService: LoadBalancerService,
              private notification: NzNotificationService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-mart-cloud/load-balancer/list']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  @ViewChild('selectedValueSpan') selectedValueSpan: ElementRef;
  @ViewChild('selectedValueOffer') selectedValueOffer: ElementRef;

  updateValue(value): void {
    console.log('value', value);
    const selectedOption = this.listSubnets?.find(option => option.id === value);
    if (selectedOption) {
      this.selectedValueSpan.nativeElement.innerText = selectedOption.name + '(' + selectedOption.subnetAddressRequired + ')';
    }
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-mart-cloud/load-balancer/list']);
  }

  onChangeStatus() {
    console.log(this.selectedValueRadio);
    if (this.selectedValueRadio == 'false') {
      this.validateForm.controls.ipFloating.clearValidators();
      this.validateForm.controls.ipFloating.updateValueAndValidity();
    }
    if (this.selectedValueRadio == 'true') {
      this.validateForm.controls.ipFloating.setValidators(Validators.required);
    }
  }


  getListVlanSubnet() {
    this.vlanService.getListVlanSubnets(9999, 1, this.region).subscribe(data => {
      this.listSubnets = data.records;
    });
  }


  searchProduct() {
    this.projectService.getProjectVpc(this.project).subscribe(data => {
      this.productId = data.cloudProject.offerIdLBSDN;
      this.catalogService.getDetailOffer(this.productId).subscribe(data2 => {
        this.offerDetail = data2;
        console.log('value', this.offerDetail);
        this.flavorId = this.offerDetail?.characteristicValues[1].charOptionValues[0];
      });

    });
  }

  // onChangeOffer(value) {
  //   this.product.id = value
  //   const selectedOption = this.offerList.find(option => option.id === value)
  //   this.selectedValueOffer.nativeElement.innerText = selectedOption.offerName;
  //   this.catalogService.getDetailOffer(Number.parseInt(value)).subscribe(data => {
  //     this.offerDetail = data;
  //     console.log('value', this.offerDetail);
  //     this.flavorId = this.offerDetail?.characteristicValues[1].id
  //
  //   });
  // }


  loadBalancerInit() {
    this.formCreateLoadBalancer.duration = this.validateForm.controls.time.value;
    this.formCreateLoadBalancer.ipAddress = this.validateForm.controls.ipAddress.value;
    this.formCreateLoadBalancer.regionId = this.region
    if (this.validateForm.controls.subnet.value != undefined || this.validateForm.controls.subnet.value != null) {
      this.formCreateLoadBalancer.subnetId = this.validateForm.controls.subnet.value;
    }

    this.formCreateLoadBalancer.description = this.validateForm.controls.description.value;
    this.formCreateLoadBalancer.name = this.validateForm.controls.name.value;
    if (this.selectedValueRadio == 'true') {
      this.formCreateLoadBalancer.isFloatingIP = true;
    }
    if (this.selectedValueRadio == 'false') {
      this.formCreateLoadBalancer.isFloatingIP = false;
    }
    // this.formCreateLoadBalancer.flavorId = this.flavorId;
    this.formCreateLoadBalancer.flavorId = '9e911d92-5607-4109-ad64-a5565cc76fa6'
    this.formCreateLoadBalancer.customerId = this.tokenService.get()?.userId;
    this.formCreateLoadBalancer.userEmail = this.tokenService.get()?.email;
    this.formCreateLoadBalancer.actorEmail = this.tokenService.get()?.email;
    this.formCreateLoadBalancer.vpcId = this.project;
    this.formCreateLoadBalancer.serviceName = this.validateForm.controls.name.value;
    this.formCreateLoadBalancer.serviceType = 15;
    this.formCreateLoadBalancer.actionType = 0;
    this.formCreateLoadBalancer.serviceInstanceId = 0;
    this.formCreateLoadBalancer.createDateInContract = null;
    this.formCreateLoadBalancer.saleDept = null;
    this.formCreateLoadBalancer.saleDeptCode = null;
    this.formCreateLoadBalancer.contactPersonEmail = null;
    this.formCreateLoadBalancer.contactPersonPhone = null;
    this.formCreateLoadBalancer.contactPersonName = null;
    this.formCreateLoadBalancer.am = null;
    this.formCreateLoadBalancer.amManager = null;
    this.formCreateLoadBalancer.note = null;
    this.formCreateLoadBalancer.isTrial = false;
    this.formCreateLoadBalancer.offerId = this.product.id;
    this.formCreateLoadBalancer.couponCode = null;
    this.formCreateLoadBalancer.dhsxkd_SubscriptionId = null;
    this.formCreateLoadBalancer.dSubscriptionNumber = null;
    this.formCreateLoadBalancer.dSubscriptionType = null;
    this.formCreateLoadBalancer.oneSMEAddonId = null;
    this.formCreateLoadBalancer.oneSME_SubscriptionId = null;
    this.formCreateLoadBalancer.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.LoadbalancerCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null';
  }


  doCreateLoadBalancerVpc() {
    this.loadBalancerInit();
    let request: FormCreate = new FormCreate();
    request.customerId = this.formCreateLoadBalancer.customerId;
    request.createdByUserId = this.formCreateLoadBalancer.customerId;
    request.note = 'tạo Load Balancer';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formCreateLoadBalancer),
        specificationType: 'loadbalancer_create',
        price: 0,
        serviceDuration: 1
      }
    ];
    console.log(request);
    this.loadBalancerService.createLoadBalancerVpc(request).subscribe(data => {
        if (data != null) {
          if (data.code == 200) {
            this.isLoading = false;
            this.notification.success('Thành công', 'Yêu cầu tạo Volume thành công.');
            this.router.navigate(['/app-smart-cloud/load-balancer/list']);
          }
        } else {
          this.isLoading = false;
          this.notification.error('Thất bại', 'Yêu cầu tạo Volume thất bại.');

        }
      },
      error => {
        this.isLoading = false;
        this.notification.error('Thất bại', 'Yêu cầu tạo Volume thất bại.');
      });
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.validateForm.controls.radio.setValue('floatingIp');
    this.getListVlanSubnet();
    this.searchProduct();
  }
}
