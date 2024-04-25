import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { IpPublicService } from '../../shared/services/ip-public.service';
import { InstancesService } from '../instances/instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CatalogService } from '../../shared/services/catalog.service';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { finalize } from 'rxjs/operators';
import { RegionModel, ProjectModel } from '../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-create-ip-floating-normal',
  templateUrl: './create-ip-floating-normal.component.html',
  styleUrls: ['./create-ip-floating-normal.component.less'],
})
export class CreateIpFloatingNormalComponent implements OnInit{
  regionId = JSON.parse(localStorage.getItem('region')).regionId;
  projectId = JSON.parse(localStorage.getItem('projectId'));
  checkIpv6: boolean = null;
  selectedAction: any;
  listIpSubnet: any[];
  listInstance: any[];
  instanceSelected: any;
  dateString = new Date();
  total: any;
  totalAmount: any;
  totalPayment: any;
  loadingIp = true;
  loadingInstanse = true;
  disableInstanse = true;
  disableIp = true;
  loadingCalculate = false;
  form = new FormGroup({
    ipSubnet: new FormControl('', {validators: [Validators.required]}),
    numOfMonth: new FormControl(1, {validators: [Validators.required, this.validNumOfMonth.bind(this)]}),
    instanceSelected: new FormControl('', {}),
  });
  dateStringExpired = new Date();
  ipName = '';
  VMName = '';
  ipId = '';
  VMId = '';
  unitPrice: any;
  constructor(private service: IpPublicService, private instancService: InstancesService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private catalogService: CatalogService,
              private router: Router) {
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.instancService.getAllIPSubnet(this.regionId)
      .pipe(finalize(() => {
        this.disableIp = false;
        this.loadingIp = false;
      }))
      .subscribe(
        (data) => {
          this.listIpSubnet = data
        }
      )
    this.instancService.search(1, 999, this.regionId, this.projectId, '', '', true, this.tokenService.get()?.userId)
      .pipe(finalize(() => {
        this.disableInstanse = false;
        this.loadingInstanse = false;
      }))
      .subscribe(
        (data) => {
          this.listInstance = data.records;
        }
      );

    this.instancService.getDetailProductByUniqueName('ipv6').subscribe(data => {
      if (data != undefined && data.length > 0) {
        let index = data.findIndex(item => item.name == 'IPv6');
        if (index != -1) {
          this.getCatalogOffer(data[index].id);
        } else {
          this.checkIpv6 = null;
        }
      } else {
        this.checkIpv6 = null;
      }
    })

    const dateExpired = new Date();
    dateExpired.setDate(dateExpired.getDate() + 30);
    this.dateStringExpired = dateExpired;
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.router.navigate(['/app-smart-cloud/ip-public']);
  }

  projectChange(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/ip-public']);
    this.projectId = project.id;
  }

  backToList() {
    this.router.navigate(['/app-smart-cloud/ip-public']);
  }

  createIpPublic() {
    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() + Number(this.form.controls['numOfMonth'].value));
    const requestBody = {
      customerId: this.tokenService.get()?.userId,
      vmToAttachId: this.VMId,
      regionId: this.regionId,
      projectId: this.projectId,
      networkId: this.ipId,
      useIpv6: this.checkIpv6,
      id: 0,
      duration: 0,
      ipAddress: null,
      offerId: 0,
      IsFloating : true,
      vpcId: this.projectId,
      oneSMEAddonId: null,
      serviceType: 4,
      serviceInstanceId: 0,
      createDate: new Date(),
      expireDate: expiredDate,
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
      couponCode: null,
      dhsxkd_SubscriptionId: null,
      dSubscriptionNumber: null,
      dSubscriptionType: null,
      oneSME_SubscriptionId: null,
      actionType: 0,
      serviceName: null,
      typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.IPCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
      userEmail: null,
      actorEmail: null
    }
    const request = {
      customerId: this.tokenService.get()?.userId,
      createdByUserId: this.tokenService.get()?.userId,
      note: "Tạo IP Public",
      orderItems: [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(requestBody),
          specificationType: "ip_create",
          price: this.total.data.totalAmount.amount / Number(this.form.controls['numOfMonth'].value),
          serviceDuration: this.form.controls['numOfMonth'].value
        }
      ]
    }

    var returnPath: string = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: request, path: returnPath}});
  }

  caculator(event) {
    let ip = '';
    let lstIp = this.form.controls['ipSubnet'].value.split('|||');
    if (lstIp.length > 1) {
      ip = lstIp[1];
      this.ipName = lstIp[0];
    }

    const vmSelect = this.form.controls['instanceSelected'].value;
    if (vmSelect == null) {
      this.form.controls['instanceSelected'].setValue('');
      this.VMName = ''
    } else {
      let lstVm = vmSelect.split('|||');
      if (lstVm.length > 1) {
        this.VMId = lstVm[1];
        this.VMName = lstVm[0];
      }
    }

    let num = this.form.controls['numOfMonth'].value;
    const dateExpired = new Date();
    dateExpired.setDate(dateExpired.getDate() + Number(num)*30);
    this.dateStringExpired = dateExpired;
    if (ip != null && ip != undefined && ip != '' &&
      num != null && num != undefined) {
      this.ipId = ip;
      this.loadingCalculate = true;
      const requestBody = {
        customerId: this.tokenService.get()?.userId,
        vmToAttachId: this.VMId,
        regionId: this.regionId,
        projectId: this.projectId,
        networkId: this.ipId,
        useIpv6: this.checkIpv6,
        IsFloating : true,
        id: 0,
        duration: 0,
        ipAddress: null,
        offerId: 0,
        vpcId: this.projectId,
        oneSMEAddonId: null,
        serviceType: 4,
        serviceInstanceId: 0,
        createDate: "0001-01-01T00:00:00",
        expireDate: "0001-01-01T00:00:00",
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
        couponCode: null,
        dhsxkd_SubscriptionId: null,
        dSubscriptionNumber: null,
        dSubscriptionType: null,
        oneSME_SubscriptionId: null,
        actionType: 0,
        serviceName: null,
        typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.IPCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
        userEmail: null,
        actorEmail: null
      }
      const request = {
        projectId: this.projectId,
        orderItems: [
          {
            orderItemQuantity: 1,
            specificationString: JSON.stringify(requestBody),
            specificationType: "ip_create",
            serviceDuration: this.form.controls['numOfMonth'].value
          }
        ]
      }
      this.service.getTotalAmount(request)
        .pipe(finalize(() => {
          this.loadingCalculate = false
        }))
        .subscribe(
          data => {
            this.total = data;
            this.totalAmount = Math.round(this.total?.data?.totalAmount?.amount);
            this.totalPayment = Math.round(this.total?.data?.totalPayment?.amount)
          }
        );
    } else {
      this.total = undefined;
    }
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

  getCatalogOffer(productId) {
    this.catalogService.getCatalogOffer(productId, this.regionId, null, null).subscribe(data => {
      console.log('data catalog', data)
      if(data) {
        this.checkIpv6 = false;
      } else {
        this.checkIpv6 = null;
      }
    })
  }
}
