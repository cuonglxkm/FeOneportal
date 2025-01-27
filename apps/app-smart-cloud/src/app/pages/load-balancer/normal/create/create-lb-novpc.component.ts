import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators
} from '@angular/forms';
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
import { debounceTime, Subject } from 'rxjs';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { OrderItem } from '../../../../shared/models/price';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import { OrderService } from '../../../../shared/services/order.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-create-lb-novpc',
  templateUrl: './create-lb-novpc.component.html',
  styleUrls: ['./create-lb-novpc.component.less']
})
export class CreateLbNovpcComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  nameList: string[] = [];
  enableInternetFacing: boolean = false;
  enableInternal: boolean = true;

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
    subnet: ['', Validators.required],
    ipAddress: ['', Validators.pattern(/^(25[0-4]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-4]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/)],
    ipFloating: [-1, [Validators.required,Validators.pattern(/^[0-9]+$/)]],
    offer: [1, Validators.required],
    description: ['', Validators.maxLength(255)],
    time: [1,{validators: [Validators.required, this.validNumOfMonth.bind(this)]}]
  });

  product: Product = new Product();
  nameProduct: string;
  offerList: OfferDetail[] = [];
  offerDetail: OfferDetail = new OfferDetail();
  formCreateLoadBalancer: FormCreateLoadBalancer = new FormCreateLoadBalancer();
  timeSelected: any;

  flavorId: string;

  selectedSubnet: string;

  isInput: boolean = true;

  isAvailable: boolean = false;
  loadingFloating = true;
  disabledFloating= true;

  @ViewChild('selectedValueSpan') selectedValueSpan: ElementRef;
  @ViewChild('selectedValueOffer') selectedValueOffer: ElementRef;
  @ViewChild('selectedValueIpFloating') selectedValueIpFloating?: ElementRef;
  invalidIpAddress = true;
  private validateIpaddress = new Subject<string>();
  private readonly debounceTimeMs = 2000;
  disabledSubnet: boolean;
  messageFail: any;
  offerId: number;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  maxAction: string = '';
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private vlanService: VlanService,
              private catalogService: CatalogService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private orderService : OrderService,
              private loadBalancerService: LoadBalancerService) {
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
    if (!this.validateForm.controls['subnet'].invalid) {
      this.validateForm.controls['ipAddress'].enable();
    } else{
      this.validateForm.controls['ipAddress'].disable();
    }
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
    this.validateForm.controls['subnet'].setValue('');
    this.validateForm.controls['ipAddress'].setValue('');
    this.enableInternetFacing = true;
    this.enableInternal = false;
    if (this.enableInternetFacing) {
      this.validateForm.controls.ipFloating.setValidators(Validators.required);
    }
    if (this.enableInternal) {
      this.validateForm.controls.ipFloating.clearValidators();
      this.validateForm.controls.ipFloating.updateValueAndValidity();
    }
    this.mapSubnetArray = [...this.mapSubnetArray1]
  }

  onChangeStatusInternal() {
    this.validateForm.controls['subnet'].setValue('');
    this.validateForm.controls['ipAddress'].setValue('');
    this.enableInternetFacing = false;
    this.enableInternal = true;
    if (this.enableInternetFacing) {
      this.validateForm.controls.ipFloating.setValidators(Validators.required);
    }
    if (this.enableInternal) {
      this.validateForm.controls.ipFloating.clearValidators();
      this.validateForm.controls.ipFloating.updateValueAndValidity();
    }
    this.mapSubnetArray = [...this.mapSubnetArray2]
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
    if (!this.validateForm.controls['ipAddress'].invalid && value!='') {
      this.validateIpaddress.next(value);
    }
  }

  getIpBySubnet(subnetId) {
    this.loadBalancerService.getIPBySubnet(subnetId, this.project, this.region)
      .pipe(finalize(() => {
        this.loadingFloating = false;
        this.disabledFloating = false;}))
      .subscribe(data => {
      this.ipFloating = data;
      console.log("object  this.ipFloating", this.ipFloating)
    });
  }

  onChangeOffer(value) {
    this.product.id = value;
    this.offerId = Number.parseInt(value);
    const selectedOption = this.offerList.find(option => option.id === value);
    this.selectedValueOffer.nativeElement.innerText = selectedOption.offerName;
    this.catalogService.getDetailOffer(Number.parseInt(value)).subscribe(data => {
      this.offerDetail = data;
      this.maxAction = data?.characteristicValues?.find(item => item.charName == 'MaxConnection')?.charOptionValues[0];
      console.log('value', this.offerDetail);
      this.flavorId = this.offerDetail?.characteristicValues?.find(item => item.charName == 'FlavorId')?.charOptionValues[0];
      this.getTotalAmount();
    });
  }
  loadingCaCulate = true;
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
    this.formCreateLoadBalancer.offerId = this.offerId;
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
    this.loadingCaCulate = true;
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
      .pipe(debounceTime(500),
      finalize(()=>{
        this.loadingCaCulate = false;
      }))
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
        this.notification.error(this.i18n.fanyi('app.status.fail'),error.error.message)
      }
    )
  }

  mapSubnet: Map<string, string> = new Map<string, string>();
  mapSubnetArray: { value: string, label: string }[] = [];
  mapSubnetArray1: { value: string, label: string }[] = [];
  mapSubnetArray2: { value: string, label: string }[] = [];
  loadingSubnet = true;
  setDataToMap(data: any) {
    // Xóa dữ liệu hiện có trong mapSubnet (nếu cần)
    this.mapSubnet?.clear();
    // Lặp qua các cặp khóa/giá trị trong dữ liệu và thêm chúng vào mapSubnet
    for (const key of Object.keys(data)) {
      this.mapSubnet?.set(key, data[key]);
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
    this.initSubnet1();
    this.initSubnet2();
    this.validateForm.controls['ipAddress'].disable();
    this.validateIpaddress.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.onInputReal(searchValue);
    });
  }


  private onInputReal(value: any) {
    this.validateForm.controls['ipAddress'].disable();
    if (!this.validateForm.controls['ipAddress'].invalid) {
      const getSubnet = this.listSubnets?.find(option => option.cloudId === this.validateForm.get('subnet').value);
      const result = this.isIpInSubnet(value, getSubnet.subnetAddressRequired);
      this.vlanService.checkIpAvailable(value, getSubnet.subnetAddressRequired, getSubnet.networkCloudId, this.region)
        .pipe(finalize(() => {
          this.validateForm.controls['ipAddress'].enable();
          if (this.invalidIpAddress == true) {
            this.validateForm.controls['ipAddress'].setErrors({ failServer: true });
          }
        }))
        .subscribe(data => {
          this.invalidIpAddress = false;
        },
        error => {
          this.messageFail = error.error;
          // this.notification.error(this.i18n.fanyi('app.status.fail'),error.error)
          this.invalidIpAddress = true;
        })
    }
  }

  onChangeTime($event: any) {
    this.validateForm.controls['time'].setValue($event);
    this.timeSelected = $event;
    this.getTotalAmount();
  }

  initSubnet1() {
    this.loadingSubnet = true;
    this.disabledSubnet = true;
    this.loadBalancerService.getListSubnetInternetFacing(this.project, this.region)
      .pipe(finalize(() => {
        this.loadingSubnet = false;
        this.disabledSubnet = false;
      }))
      .subscribe(data => {
        this.setDataToMap(data);
        if (this.mapSubnet instanceof Map) {
          // Chuyển đổi Map thành mảng các cặp khóa/giá trị
          for (const [key, value] of this.mapSubnet.entries()) {
            this.mapSubnetArray1?.push({ value: value, label: key });
          }
          this.mapSubnetArray = [...this.mapSubnetArray1]
        }
      },
        error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'), 'Lấy danh sách Subnet thộc Internet Facing lỗi');
        });
  }

  initSubnet2() {
    this.loadingSubnet = true;
    this.disabledSubnet = true;
    let formSearchSubnet = new FormSearchSubnet();
    formSearchSubnet.region = this.region;
    formSearchSubnet.vpcId = this.project;
    formSearchSubnet.pageSize = 9999;
    formSearchSubnet.pageNumber = 1;
    formSearchSubnet.customerId = this.tokenService.get()?.userId;
    formSearchSubnet.name = '';
    this.vlanService.getSubnetByNetwork(formSearchSubnet)
      .pipe(finalize(() => {
        this.loadingSubnet = false;
        this.disabledSubnet = false;
      }))
      .subscribe(data => {
        this.mapSubnet?.clear();
        // Lặp qua các cặp khóa/giá trị trong dữ liệu và thêm chúng vào mapSubnet
        for (const model of data.records) {
          this.mapSubnetArray2?.push({ value: model.subnetCloudId, label: model.name + '(' + model.subnetAddressRequired + ')' });
        }
      });
  }

  validNumOfMonth(control: AbstractControl): ValidationErrors | null { //valid keypair
    var regex = new RegExp("/^(100|[1-9][0-9]?|[1-9])$/")
    if (control && control.value != null && control.value != undefined && control.value.length > 0) {
      if (regex.test(control.value) == false) {
        return {validKeypairName: true};
      }
    }
    return null;
  }
}

