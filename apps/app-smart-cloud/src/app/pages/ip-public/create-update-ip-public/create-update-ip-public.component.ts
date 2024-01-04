import {Component, Inject, Input, OnInit} from '@angular/core';
import {IpPublicService} from "../../../shared/services/ip-public.service";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {InstancesService} from "../../instances/instances.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AppValidator} from "../../../../../../../libs/common-utils/src";
import {finalize} from "rxjs/operators";
import {NzMessageService} from "ng-zorro-antd/message";
import {Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd/notification";

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
  instanceSelected;
  dateString = new Date();

  form = new FormGroup({
    ipSubnet: new FormControl('', {validators: [Validators.required]}),
    numOfMonth: new FormControl('', {validators: [Validators.required]}),
 });
  constructor(private service: IpPublicService, private instancService: InstancesService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    if (this.regionId === 3 || this.regionId === 5) {
      this.checkIpv6 = false;
    } else {
      this.checkIpv6 = null;
    }

    this.instancService.getAllIPSubnet(this.regionId).subscribe(
      (data) => {
        this.listIpSubnet = data
      }
    )
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    this.instancService.search(1,999,this.regionId, this.projectId,'','', true, this.tokenService.get()?.userId).subscribe(
      (data) => {
        this.listInstance = data.records;
      }
    )
  }

  backToList(){
    this.router.navigate(['/app-smart-cloud/ip-public']);
  }

  createIpPublic(){
    const requestBody = {
      customerId: this.tokenService.get()?.userId,
      vmToAttachId: this.instanceSelected,
      regionId: this.regionId,
      projectId: this.projectId,
      networkId: this.form.controls['ipSubnet'].value,
      useIpv6:this.checkIpv6,
      id: 0,
      duration: 0,
      ipAddress: null,
      offerId: 0,
      useIPv6: null,
      vpcId: null,
      oneSMEAddonId: null,
      serviceType: 0,
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
      customerId: this.tokenService.get()?.userId,
      createdByUserId: this.tokenService.get()?.userId,
      note: "Tạo Ip Public",
      orderItems: [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(requestBody),
          specificationType: "ip_create",
          price: 0,
          serviceDuration: this.form.controls['numOfMonth'].value
        }
      ]
    }
    this.service.createIpPublic(request)
      .subscribe({
        next: post => {
          this.notification.success('Thành công', 'Tạo mới thành công Ip Public')
        },
        error: e => {
          this.notification.error('Thất bại', 'Tạo mới thất bại Ip Public')
        },
      });

    this.router.navigate(['/app-smart-cloud/ip-public']);
  }

}
