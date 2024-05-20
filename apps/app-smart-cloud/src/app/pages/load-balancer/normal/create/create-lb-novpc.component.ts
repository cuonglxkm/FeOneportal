import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { VlanService } from '../../../../shared/services/vlan.service';
import { FormSearchSubnet, Subnet } from '../../../../shared/models/vlan.model';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { OfferDetail, Product } from '../../../../shared/models/catalog.model';
import {
  FormCreateLoadBalancer,
  FormOrder,
  FormSearchListBalancer,
  IPBySubnet
} from '../../../../shared/models/load-balancer.model';
import { DataPayment, ItemPayment } from '../../../instances/instances.model';
import { debounceTime } from 'rxjs';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { OrderItem } from '../../../../shared/models/price';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-create-lb-novpc',
  templateUrl: './create-lb-novpc.component.html',
  styleUrls: ['./create-lb-novpc.component.less']
})
export class CreateLbNovpcComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  nameList: string[] = [];
  enableInternetFacing: boolean = true;
  enableInternal: boolean = false;

  listSubnets: Subnet[];

  validateForm: FormGroup<{
    name: FormControl<string>
    radio: FormControl<any>
    subnet: FormControl<string>
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
    subnet: [''],
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
  formCreateLoadBalancer: FormCreateLoadBalancer = new FormCreateLoadBalancer();
  timeSelected: any;

  flavorId: string;

  selectedSubnet: string;
  selectedSubnetValue: string;

  isInput: boolean = true;

  isAvailable: boolean = false;

  @ViewChild('selectedValueSpan') selectedValueSpan: ElementRef;
  @ViewChild('selectedValueOffer') selectedValueOffer: ElementRef;
  @ViewChild('selectedValueIpFloating') selectedValueIpFloating?: ElementRef;

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private vlanService: VlanService,
              private catalogService: CatalogService,
              private loadBalancerService: LoadBalancerService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/load-balancer/list']);
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

  getListLoadBalancer() {
    let formSearchLB = new FormSearchListBalancer();
    formSearchLB.regionId = this.region;
    formSearchLB.currentPage = 1;
    formSearchLB.pageSize = 9999;
    formSearchLB.vpcId = this.project;
    formSearchLB.isCheckState = true;
    this.loadBalancerService.search(formSearchLB).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item?.name);
      });
    });
  }


  selectedIp(value) {
    const selectedOption = this.ipFloating?.find(option => option.id === value)
    if(selectedOption) {
      this.selectedValueIpFloating.nativeElement.innerText = selectedOption?.ipAddress
    }

  }



  updateValue(value): void {

    if (this.listSubnets) {
      const selected = this.listSubnets?.find(option => option.cloudId === value);
      if(selected){
        this.selectedValueSpan.nativeElement.innerText = selected.name + '(' + selected.subnetAddressRequired + ')';
      }
      this.getIpBySubnet(selected?.cloudId)
    }
    this.getTotalAmount();
  }
  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/load-balancer/list']);
  }

  onChangeStatusInternetFacing() {
    this.enableInternetFacing = true;
    this.enableInternal = false;
    if (this.enableInternetFacing) {
      this.validateForm.controls.ipFloating.setValidators(Validators.required);
    }
    if (this.enableInternal) {
      this.validateForm.controls.ipFloating.clearValidators();
      this.validateForm.controls.ipFloating.updateValueAndValidity();
    }
    this.getListSubnetInternetFacing();
  }

  onChangeStatusInternal() {
    this.enableInternetFacing = false;
    this.enableInternal = true;
    if (this.enableInternetFacing) {
      this.validateForm.controls.ipFloating.setValidators(Validators.required);
    }
    if (this.enableInternal) {
      this.validateForm.controls.ipFloating.clearValidators();
      this.validateForm.controls.ipFloating.updateValueAndValidity();
    }
    this.getListSubnetInternetFacing();
  }


  getListVlanSubnet() {
    this.vlanService.getListVlanSubnets(9999, 1, this.region, this.project).subscribe(data => {
      this.listSubnets = data.records;
      // this.listSubnets.forEach(item => {
      //   this.validateForm.controls.subnet.setValue(this.listSubnets[0]?.id)
      // })
    });
  }

  ipFloating: IPBySubnet[] = [];

  searchProduct() {
    this.catalogService.searchProduct('loadbalancer').subscribe(data => {
      this.catalogService.getCatalogOffer(null, this.region, null, data[0]?.uniqueName).subscribe(data => {
        this.offerList = data;
        this.validateForm.controls.offer.setValue(this.offerList[0]?.id);
      });
    });
  }

  isIpInSubnet(ipAddress: string, subnet: string): boolean {
    function ipToDecimal(ip: string): number {
      return ip.split('.').reduce((acc, octet, index, array) => {
        return acc + parseInt(octet) * Math.pow(256, (array.length - index - 1));
      }, 0);
    }

    // Chuyển subnet thành số nguyên
    const subnetDecimal = ipToDecimal(subnet);

    // Chuyển địa chỉ IP thành số nguyên
    const ipDecimal = ipToDecimal(ipAddress);

    // Lấy prefix length từ subnet (ví dụ: 24 từ 192.168.0.0/24)
    const prefixLength = parseInt(subnet.split('/')[1], 10);

    // Tính toán subnet mask từ prefix length
    const subnetMask = Math.pow(2, 32) - Math.pow(2, 32 - prefixLength);

    // So sánh địa chỉ IP với subnet
    return (ipDecimal & subnetMask) === (subnetDecimal & subnetMask);
  }

  onInput(value) {
    const getSubnet = this.listSubnets?.find(option => option.cloudId === this.validateForm.get('subnet').value);
    const result = this.isIpInSubnet(value, getSubnet.subnetAddressRequired);
    if (value == undefined || value.trim().length === 0) {
      console.log('1');
      this.isInput = true;
    } else {
      if (result) {
        console.log('3');
        this.isInput = true;
      } else {
        console.log('4');
        this.isInput = false;
      }
      this.loadBalancerService.checkIpAddress(getSubnet.subnetCloudId, value, this.region, this.project)
        .subscribe(data => {
          this.isAvailable = data;
        }, error => {
          this.isAvailable = false;
        });

    }


  }

  getIpBySubnet(subnetId) {
    this.loadBalancerService.getIPBySubnet(subnetId, this.project, this.region).subscribe(data => {
      this.ipFloating = data;
    });
  }

  onChangeOffer(value) {
    this.product.id = value;
    const selectedOption = this.offerList.find(option => option.id === value);
    this.selectedValueOffer.nativeElement.innerText = selectedOption.offerName;
    this.catalogService.getDetailOffer(Number.parseInt(value)).subscribe(data => {
      this.offerDetail = data;
      console.log('value', this.offerDetail);
      this.flavorId = this.offerDetail?.characteristicValues[1].charOptionValues[0];
      this.getTotalAmount();
    });
  }

  timeSelectedChange(value) {
    this.timeSelected = value;
    console.log(this.timeSelected);
    this.getTotalAmount();
  }

  loadBalancerInit() {
    console.log('init', this.formCreateLoadBalancer)
    console.log('valid form', this.validateForm)
    this.formCreateLoadBalancer.duration = this.validateForm.controls.time.value;
    if (this.validateForm.controls.ipAddress.value == undefined || this.validateForm.controls.ipAddress.value == '') {
      this.formCreateLoadBalancer.ipAddress = null;
    } else {
      this.formCreateLoadBalancer.ipAddress = this.validateForm.controls.ipAddress.value;
    }

    this.formCreateLoadBalancer.regionId = this.region;
    if (this.validateForm.controls.subnet.value != undefined || this.validateForm.controls.subnet.value != null) {
      this.formCreateLoadBalancer.subnetId = this.validateForm.controls.subnet.value;
    }

    this.formCreateLoadBalancer.description = this.validateForm.controls.description.value;
    this.formCreateLoadBalancer.name = this.validateForm.controls.name.value;
    if (this.enableInternetFacing) {
      this.formCreateLoadBalancer.isFloatingIP = true;
      this.formCreateLoadBalancer.ipPublicId = this.validateForm.controls.ipFloating.value;
    }
    if (this.enableInternal) {
      this.formCreateLoadBalancer.isFloatingIP = false;
      this.formCreateLoadBalancer.ipPublicId = null;
    }
    this.formCreateLoadBalancer.flavorId = this.flavorId;
    // this.formCreateLoadBalancer.flavorId = '9e911d92-5607-4109-ad64-a5565cc76fa6';
    this.formCreateLoadBalancer.customerId = this.tokenService.get()?.userId;
    this.formCreateLoadBalancer.userEmail = this.tokenService.get()?.email;
    this.formCreateLoadBalancer.actorEmail = this.tokenService.get()?.email;
    this.formCreateLoadBalancer.projectId = this.project;
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

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  getTotalAmount() {

    this.loadBalancerInit();

    console.log('offer id', this.formCreateLoadBalancer.offerId);

    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formCreateLoadBalancer);
    itemPayment.specificationType = 'loadbalancer_create';
    itemPayment.serviceDuration = this.validateForm.get('time').value;
    itemPayment.sortItem = 0;

    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.loadBalancerService.totalAmount(dataPayment)
      .pipe(debounceTime(500))
      .subscribe((result) => {
        console.log('thanh tien Load balancer', result.data);
        this.orderItem = result.data;
        this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
      });
  }

  navigateToPaymentSummary() {
    this.loadBalancerInit()
    let request: FormOrder = new FormOrder();
    request.customerId = this.formCreateLoadBalancer.customerId;
    request.createdByUserId = this.formCreateLoadBalancer.customerId;
    request.note = 'tạo Load Balancer';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formCreateLoadBalancer),
        specificationType: 'loadbalancer_create',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ];
    var returnPath: string = '/app-smart-cloud/load-balancer/create';
    console.log('request', request);
    console.log('service name', this.formCreateLoadBalancer.serviceName);
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: request, path: returnPath }
    });
  }

  mapSubnet: Map<string, string> = new Map<string, string>();
  mapSubnetArray: { value: string, label: string }[] = [];
  setDataToMap(data: any) {
    // Xóa dữ liệu hiện có trong mapSubnet (nếu cần)
    this.mapSubnet?.clear();
    // Lặp qua các cặp khóa/giá trị trong dữ liệu và thêm chúng vào mapSubnet
    for (const key of Object.keys(data)) {
      this.mapSubnet?.set(key, data[key]);
    }
  }

  getListSubnetInternetFacing() {
    if (this.enableInternal == true) {
      let formSearchSubnet = new FormSearchSubnet();
      formSearchSubnet.region = this.region;
      formSearchSubnet.pageSize = 9999;
      formSearchSubnet.pageNumber = 1;
      formSearchSubnet.customerId = this.tokenService.get()?.userId;
      formSearchSubnet.name = '';
      this.vlanService.getSubnetByNetwork(formSearchSubnet).subscribe(data => {
        this.mapSubnet?.clear();
        // Lặp qua các cặp khóa/giá trị trong dữ liệu và thêm chúng vào mapSubnet
        for (const model of data.records) {
          this.mapSubnetArray?.push({ value: model.subnetCloudId, label: model.name });
        }
      });
    } else {
      this.loadBalancerService.getListSubnetInternetFacing(this.project, this.region).subscribe(data => {
        this.setDataToMap(data);
        if (this.mapSubnet instanceof Map) {
          // Chuyển đổi Map thành mảng các cặp khóa/giá trị
          for (const [key, value] of this.mapSubnet.entries()) {
            this.mapSubnetArray?.push({ value: value, label: key });
          }
        }
      });
    }
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.validateForm.controls.radio.setValue('floatingIp');
    this.getListVlanSubnet();
    this.searchProduct();
    // this.getIpBySubnet();
    this.getListLoadBalancer();

    this.getListSubnetInternetFacing();
  }


}

