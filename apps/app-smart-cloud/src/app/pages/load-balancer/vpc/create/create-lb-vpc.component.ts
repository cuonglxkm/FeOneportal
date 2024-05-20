import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Subnet } from '../../../../shared/models/vlan.model';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { OfferDetail, Product } from '../../../../shared/models/catalog.model';
import {
  FormCreateLoadBalancer,
  FormOrder,
  FormSearchListBalancer,
  IPBySubnet
} from '../../../../shared/models/load-balancer.model';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VlanService } from '../../../../shared/services/vlan.service';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { finalize } from 'rxjs';
import { ProjectService } from 'src/app/shared/services/project.service';

@Component({
  selector: 'one-portal-create-lb-vpc',
  templateUrl: './create-lb-vpc.component.html',
  styleUrls: ['./create-lb-vpc.component.less']
})
export class CreateLbVpcComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  nameList: string[] = [];
  enableInternetFacing: boolean = true;
  enableInternal: boolean = false;
  listSubnets: Subnet[] = [];

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
  offerDetail: OfferDetail = new OfferDetail();
  formCreateLoadBalancer: FormCreateLoadBalancer = new FormCreateLoadBalancer();

  productId: number;

  flavorId: string;
  isLoading: boolean = false;

  selectedSubnet: any;

  isInput: boolean = true;

  ipFloating: IPBySubnet[] = [];

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private vlanService: VlanService,
              private catalogService: CatalogService,
              private projectService: ProjectService,
              private loadBalancerService: LoadBalancerService,
              private notification: NzNotificationService) {
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

  onInput(value: string) {
    const getSubnet = this.listSubnets?.find(option => option.cloudId === this.validateForm.get('subnet').value);

    const result = this.isIpInSubnet(value, getSubnet.subnetAddressRequired);

    // console.log('result', result);
    // console.log('value', value)

    if (value == undefined || value.trim().length === 0) {
      this.isInput = true;
    } else {
      if (result) {
        this.isInput = true;
      } else {
        this.isInput = false;
      }
    }
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

  @ViewChild('selectedValueSpan') selectedValueSpan: ElementRef;
  @ViewChild('selectedValueOffer') selectedValueOffer: ElementRef;
  @ViewChild('selectedValueIpFloating') selectedValueIpFloating: ElementRef;

  updateValue(value): void {
    // this.validateForm.controls.subnet.setValue(value);
    if (this.listSubnets) {
      const selected = this.listSubnets?.find(option => option.cloudId === value);
      if(selected){
        this.selectedValueSpan.nativeElement.innerText = selected.name + '(' + selected.subnetAddressRequired + ')';
      }
      this.getIpBySubnet(selected?.cloudId)
    }

  }

  selectedIp(value) {
    if(this.ipFloating) {
      const selectedOption = this.ipFloating?.find(option => option.id === value);
      if(selectedOption) {
        this.selectedValueIpFloating.nativeElement.innerText = selectedOption.ipAddress;
        // this.validateForm.controls.ipFloating.setValue(selectedOption.id);
      }
    }
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
  }


  getListVlanSubnet() {
    this.vlanService.getListVlanSubnets(9999, 1, this.region, this.project).subscribe(data => {
      this.listSubnets = data?.records;
    });
  }


  searchProduct() {
    this.projectService.getProjectVpc(this.project).subscribe(data => {
      this.productId = data?.cloudProject?.offerIdLBSDN;
      this.catalogService.getDetailOffer(this.productId).subscribe(data2 => {
        this.offerDetail = data2;
        this.flavorId = this.offerDetail?.characteristicValues[1].charOptionValues[0];
      });

    });
  }

  getIpBySubnet(subnetId) {
    this.loadBalancerService.getIPBySubnet(subnetId, this.project, this.region).subscribe(data => {
      this.ipFloating = data;
    });
  }

  loadBalancerInit() {
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


  doCreateLoadBalancerVpc() {
    this.loadingCreate = true;
    this.loadBalancerInit();
    let request: FormOrder = new FormOrder();
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
    this.loadBalancerService.createLoadBalancer(request)
      .pipe(finalize(() => {
        this.loadingCreate = false;
      }))
      .subscribe(data => {
        if (data != null) {
          if (data.code == 200) {
            this.isLoading = false;
            this.notification.success(
              '',
              this.i18n.fanyi('app.notification.request.create.LB.success')
            );
            this.router.navigate(['/app-smart-cloud/load-balancer/list']);
          }
        } else {
          this.isLoading = false;
          this.notification.error(
            '',
            this.i18n.fanyi('app.notification.request.create.LB.fail')
          );
        }
      },
      error => {
        this.isLoading = false;
        this.notification.error(
          '',
          this.i18n.fanyi('app.notification.request.create.LB.fail')
        );
      });
  }

  mapSubnet: Map<string, string> = new Map<string, string>();
  mapSubnetArray: { value: string, label: string }[] = [];
  loadingCreate = false;

  setDataToMap(data: any) {
    // Xóa dữ liệu hiện có trong mapSubnet (nếu cần)
    this.mapSubnet?.clear();
    // Lặp qua các cặp khóa/giá trị trong dữ liệu và thêm chúng vào mapSubnet
    for (const key of Object.keys(data)) {
      this.mapSubnet?.set(key, data[key]);
    }
  }

  getListSubnetInternetFacing() {
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
