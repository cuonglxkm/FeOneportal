import {Component, Inject, OnInit} from '@angular/core';
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
  regionId: number;
  projectId: number;
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
      this.checkIpv6 = true;
    } else {
      this.checkIpv6 = null;
    }

    this.instancService.getAllIPSubnet(this.regionId).subscribe(
      (data) => {
        this.listIpSubnet = data
      }
    )
    this.instancService.search(1,999,this.regionId, this.projectId,'','', true, this.tokenService.get()?.userId).subscribe(
      (data) => {
        this.listInstance = data.records;
      }
    )
    // this.getSshKeys();
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    // this.getSshKeys();
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
