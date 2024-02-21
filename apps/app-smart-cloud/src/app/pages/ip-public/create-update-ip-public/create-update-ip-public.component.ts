import {Component, Inject, Input, OnInit} from '@angular/core';
import {IpPublicService} from "../../../shared/services/ip-public.service";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {InstancesService} from "../../instances/instances.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {AbstractControl, FormControl, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {AppValidator} from "../../../../../../../libs/common-utils/src";
import {finalize} from "rxjs/operators";
import {NzMessageService} from "ng-zorro-antd/message";
import {Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {getCurrentRegionAndProject} from "@shared";

@Component({
  selector: 'one-portal-create-update-ip-public',
  templateUrl: './create-update-ip-public.component.html',
  styleUrls: ['./create-update-ip-public.component.less'],
})
export class CreateUpdateIpPublicComponent implements OnInit{
  regionId = JSON.parse(localStorage.getItem('region')).regionId;
  projectId = JSON.parse(localStorage.getItem('projectId'));
  checkIpv6: boolean;
  selectedAction: any;
  listIpSubnet: any[];
  listInstance: any[];
  instanceSelected: any;
  dateString = new Date();
  total: any;
  loadingIp = true;
  loadingInstanse = true;
  disableInstanse = true;
  disableIp = true;
  loadingCalculate = false;
  form = new FormGroup({
    ipSubnet: new FormControl('', {validators: [Validators.required]}),
    numOfMonth: new FormControl('', {validators: [Validators.required, this.validNumOfMonth.bind(this)]} ),
    instanceSelected: new FormControl('', {}),
 });
  constructor(private service: IpPublicService, private instancService: InstancesService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private router: Router) {
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
  }

  onRegionChange(region: RegionModel) {

    this.regionId = region.regionId;
    if (this.regionId === 3 || this.regionId === 5) {
      this.checkIpv6 = false;
    } else {
      this.checkIpv6 = null;
    }

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


  }

  projectChange(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/ip-public']);

    this.projectId = project.id;
    this.instancService.search(1,999,this.regionId, this.projectId,'','', true, this.tokenService.get()?.userId)
      .pipe(finalize(() => {
        this.disableInstanse = false;
        this.loadingInstanse = false;
      }))
      .subscribe(
      (data) => {
        this.listInstance = data.records;
      }
    )


  }

  backToList(){
    this.router.navigate(['/app-smart-cloud/ip-public']);
  }

  createIpPublic(){
    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() + Number(this.form.controls['numOfMonth'].value));
    const requestBody = {
      customerId: this.tokenService.get()?.userId,
      vmToAttachId: this.form.controls['instanceSelected'].value,
      regionId: this.regionId,
      projectId: this.projectId,
      networkId: this.form.controls['ipSubnet'].value,
      useIpv6:this.checkIpv6,
      id: 0,
      duration: 0,
      ipAddress: null,
      offerId: 0,
      useIPv6: null,
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
      note: "Tạo Ip Public",
      orderItems: [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(requestBody),
          specificationType: "ip_create",
          price: this.total.data.totalPayment.amount / Number(this.form.controls['numOfMonth'].value),
          serviceDuration: this.form.controls['numOfMonth'].value
        }
      ]
    }

    var returnPath: string = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request,path: returnPath } });
  }

  caculator(event)   {

    let ip = this.form.controls['ipSubnet'].value;
    let num = this.form.controls['numOfMonth'].value;

    if (ip != null && ip != undefined && ip != '' &&
      num != null && num != undefined && num != '') {
      this.loadingCalculate = true;
      const requestBody = {
        customerId: this.tokenService.get()?.userId,
        vmToAttachId: this.form.controls['instanceSelected'].value,
        regionId: this.regionId,
        projectId: this.projectId,
        networkId: this.form.controls['ipSubnet'].value,
        useIpv6:this.checkIpv6,
        id: 0,
        duration: 0,
        ipAddress: null,
        offerId: 0,
        useIPv6: null,
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
        .pipe(finalize(() => {this.loadingCalculate = false}))
        .subscribe(
        data => {
          this.total = data;
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
}
