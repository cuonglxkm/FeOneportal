import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';
import { Router } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { VlanService } from '../../../../shared/services/vlan.service';
import { Subnet } from '../../../../shared/models/vlan.model';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { OfferDetail, Product } from '../../../../shared/models/catalog.model';
import { FormCreateLoadBalancer } from '../../../../shared/models/load-balancer.model';
import { DataPayment, ItemPayment } from '../../../instances/instances.model';
import { debounceTime } from 'rxjs';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { OrderItem } from '../../../../shared/models/price';

@Component({
  selector: 'one-portal-create-lb-novpc',
  templateUrl: './create-lb-novpc.component.html',
  styleUrls: ['./create-lb-novpc.component.less']
})
export class CreateLbNovpcComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  nameList: string[];
  selectedValueRadio = 'true';
  listSubnets: Subnet[];

  validateForm: FormGroup<{
    name: FormControl<string>
    radio: FormControl<any>
    subnet: FormControl<number>
    ipAddress: FormControl<string>
    ipFloating: FormControl<number>
    offer: FormControl<number>
    description: FormControl<string>
    time: FormControl<number>
  }> = this.fb.group({
    name: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      this.duplicateNameValidator.bind(this), Validators.maxLength(50)]],
    radio: [''],
    subnet: [1],
    ipAddress: ['', Validators.pattern(/^(\d{1,3}\.){3}\d{1,3}$/)],
    ipFloating: [0],
    offer: [1, Validators.required],
    description: ['', Validators.maxLength(255)],
    time: [1, Validators.required]
  });

  product: Product = new Product();
  nameProduct: string;
  offerList: OfferDetail[] = [];
  offerDetail: OfferDetail = new OfferDetail();
  formCreateLoadBalancer: FormCreateLoadBalancer = new FormCreateLoadBalancer()
  timeSelected: any;

  flavorId: number

  selectedSubnet: string
  selectedSubnetValue: string
  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private vlanService: VlanService,
              private catalogService: CatalogService,
              private loadBalancerService: LoadBalancerService) {
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
    console.log('value', value)
    const selectedOption = this.listSubnets.find(option => option.id === value);
    if (selectedOption) {
      this.selectedValueSpan.nativeElement.innerText = selectedOption.name + '(' + selectedOption.subnetAddressRequired + ')';
    }
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-mart-cloud/load-balancer/list']);
  }

  onChangeStatus() {
    console.log(this.selectedValueRadio);
    if(this.selectedValueRadio == 'false') {
      this.validateForm.controls.ipFloating.clearValidators()
      this.validateForm.controls.ipFloating.updateValueAndValidity()
    }
    if(this.selectedValueRadio == 'true') {
      this.validateForm.controls.ipFloating.setValidators(Validators.required)
    }
  }


  getListVlanSubnet() {
    this.vlanService.getListVlanSubnets(9999, 1, this.region).subscribe(data => {
      this.listSubnets = data.records;
      // this.listSubnets.forEach(item => {
      //   this.validateForm.controls.subnet.setValue(this.listSubnets[0]?.id)
      // })
    });
  }


  searchProduct() {
    this.catalogService.searchProduct('loadbalancer').subscribe(data => {
      this.catalogService.getCatalogOffer(null, this.region, null, data[0]?.uniqueName).subscribe(data => {
        this.offerList = data;
        this.validateForm.controls.offer.setValue(this.offerList[0]?.id)
      });
    });
  }

  onChangeOffer(value) {
    this.product.id = value
    const selectedOption = this.offerList.find(option => option.id === value)
    this.selectedValueOffer.nativeElement.innerText = selectedOption.offerName;
    this.catalogService.getDetailOffer(Number.parseInt(value)).subscribe(data => {
      this.offerDetail = data;
      console.log('value', this.offerDetail);
      this.flavorId = this.offerDetail?.characteristicValues[1].id

      this.getTotalAmount()
    });
  }

  timeSelectedChange(value) {
    this.timeSelected = value;
    console.log(this.timeSelected);
    this.getTotalAmount();
  }

  loadBalancerInit() {
    this.formCreateLoadBalancer.duration = this.validateForm.controls.time.value
    this.formCreateLoadBalancer.ipAddress = this.validateForm.controls.ipAddress.value
    if(this.validateForm.controls.subnet.value != undefined || this.validateForm.controls.subnet.value != null) {
      this.formCreateLoadBalancer.subnetId = this.validateForm.controls.subnet.value.toString()
    }

    this.formCreateLoadBalancer.description = this.validateForm.controls.description.value
    this.formCreateLoadBalancer.name = this.validateForm.controls.name.value
    this.formCreateLoadBalancer.regionId = this.region
    if(this.selectedValueRadio == 'true') {
      this.formCreateLoadBalancer.isFloatingIP = true
    }
    if(this.selectedValueRadio == 'false') {
      this.formCreateLoadBalancer.isFloatingIP = false
    }
    this.formCreateLoadBalancer.flavorId = this.flavorId.toString()
    this.formCreateLoadBalancer.customerId = this.tokenService.get()?.userId
    this.formCreateLoadBalancer.userEmail = this.tokenService.get()?.email
    this.formCreateLoadBalancer.actorEmail = this.tokenService.get()?.email;
    this.formCreateLoadBalancer.vpcId = this.project
    this.formCreateLoadBalancer.serviceName = this.validateForm.controls.name.value
    this.formCreateLoadBalancer.serviceType = 15
    this.formCreateLoadBalancer.actionType = 0
    this.formCreateLoadBalancer.serviceInstanceId = 0
    this.formCreateLoadBalancer.createDateInContract = null
    this.formCreateLoadBalancer.saleDept = null
    this.formCreateLoadBalancer.saleDeptCode = null
    this.formCreateLoadBalancer.contactPersonEmail = null
    this.formCreateLoadBalancer.contactPersonPhone = null
    this.formCreateLoadBalancer.contactPersonName = null
    this.formCreateLoadBalancer.am = null
    this.formCreateLoadBalancer.amManager = null
    this.formCreateLoadBalancer.note = null
    this.formCreateLoadBalancer.isTrial = false
    this.formCreateLoadBalancer.offerId = this.product.id
    this.formCreateLoadBalancer.couponCode = null
    this.formCreateLoadBalancer.dhsxkd_SubscriptionId = null
    this.formCreateLoadBalancer.dSubscriptionNumber = null
    this.formCreateLoadBalancer.dSubscriptionType = null
    this.formCreateLoadBalancer.oneSMEAddonId = null
    this.formCreateLoadBalancer.oneSME_SubscriptionId = null
    this.formCreateLoadBalancer.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.LoadbalancerCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null"
  }

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  getTotalAmount() {
    this.loadBalancerInit()
    console.log('offer id', this.formCreateLoadBalancer.offerId)
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formCreateLoadBalancer);
    itemPayment.specificationType = 'loadbalancer_create';
    itemPayment.serviceDuration = this.validateForm.get('time').value;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.loadBalancerService.totalAmount(itemPayment)
      .pipe(debounceTime(500))
      .subscribe((result) => {
        console.log('thanh tien volume', result.data);
        this.orderItem = result.data;
        this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
      });
  }

  navigateToPaymentSummary() {

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

