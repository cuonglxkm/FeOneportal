import { Component, Inject, OnInit } from '@angular/core';
import {TotalVpcResource, VpcModel} from "../../../shared/models/vpc.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {VpcService} from "../../../shared/services/vpc.service";
import {ActivatedRoute, Router} from "@angular/router";
import {getCurrentRegionAndProject} from "@shared";
import {finalize} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { IpPublicService } from '../../../shared/services/ip-public.service';
import { setDate } from 'date-fns';
import { OrderService } from 'src/app/shared/services/order.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-project-extend',
  templateUrl: './project-extend.component.html',
  styleUrls: ['./project-extend.component.less'],
})
export class ProjectExtendComponent implements OnInit{
  regionId: any;
  listOfData = [{}];
  data: VpcModel;
  projectDetail:VpcModel;
  dataTotal: TotalVpcResource;
  percentCpu: number = 0;
  percentRam: number = 0;
  percentHHD: number = 0;
  percentSSD: number = 0;
  percentIPFloating: number = 0;
  percentBackup: number = 0;
  totalAmount = 0;
  totalPayment = 0;
  totalVAT =0;
  loadingCalculate= false;
  form = new FormGroup({
    numOfMonth: new FormControl(1, {validators: [Validators.required]}),
  });
  today: any;
  expiredDate: any;
  expiredDateOld: any;
  timeSelected:number=1;
  
  loading = true;
  total: any;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private service: VpcService,
              private router: Router,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private ipService: IpPublicService,
              private activatedRoute: ActivatedRoute, private orderService: OrderService,  private notification: NzNotificationService) {
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getData(id);
    // this.caculate()
    
    // this.onChangeTime()
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.router.navigate(['/app-smart-cloud/project'])
  }

  private getData(id: any) {
    this.loading = true;
    this.service.getDetail(id)
      .pipe(finalize(() => {this.loading = false;}))
      .subscribe(
        data => {
          this.data  = data;
         
          this.expiredDate = data.expireDate;
          this.today = data.createDate;
          const expiredDateOld = new Date(this.expiredDate);
          expiredDateOld.setDate(expiredDateOld.getDate() + Number(this.form.controls['numOfMonth'].value * 30));
          this.expiredDateOld = expiredDateOld;
          this.caculate();
        }
      )

    this.service.getTotalResouce(id)
      .pipe(finalize(() => {
        this.pushTable();
      }))
      .subscribe(
        data => {
          this.dataTotal = data;
        }
      )
  }

  private pushTable() {
    this.listOfData = [];
    let total = this.dataTotal.cloudProject;
    let used = this.dataTotal.cloudProjectResourceUsed;
    this.listOfData.push({name : "CPU (vCPU)",total: total.quotavCpu + " vCPU",used:used.cpu + " vCPU",remain: (total.quotavCpu - used.cpu) + " vCPU"});
    this.listOfData.push({name : "RAM (GB)",total: total.quotaRamInGb + " GB",used:used.ram + " GB",remain:(total.quotaRamInGb - used.ram) + " GB"});
    this.listOfData.push({name : "HDD (GB)",total: total.quotaHddInGb + " GB",used:used.hdd + " GB",remain:(total.quotaHddInGb - used.hdd) + " GB"});
    this.listOfData.push({name : "SSD (GB)",total: total.quotaSSDInGb + " GB",used:used.ssd + " GB",remain:(total.quotaSSDInGb - used.ssd) + " GB"});
    this.listOfData.push({name : this.i18n.fanyi('app.capacity') + " Backup Volume/VN(GB)", total:total.quotaBackupVolumeInGb + " GB",used:used.backup + " GB",remain: (total.quotaBackupVolumeInGb - used.backup) + " GB"});
    this.listOfData.push({name : this.i18n.fanyi('app.amount') + " IP Floating",total: total.quotaIpFloatingCount,used:"NON",remain:"10"});
    this.listOfData.push({name : this.i18n.fanyi('app.amount') + " IP Public",total:total.quotaIpPublicCount,used:used.ipPublicCount,remain: (total.quotaIpPublicCount - used.ipPublicCount)});
    this.listOfData.push({name : this.i18n.fanyi('app.amount') + " IPv6",total:total.quotaIpv6Count,used:used.ipv6Count,remain:(total.quotaIpv6Count - used.ipv6Count)});
    this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Network",total: total.quotaNetworkCount,used:used.networkCount,remain:(total.quotaNetworkCount - used.networkCount)});
    this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Security Group",total: total.quotaSecurityGroupCount,used:used.securityGroupCount,remain:(total.quotaSecurityGroupCount - used.securityGroupCount)});
    this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Router",total: total.quotaRouterCount,used:used.routerCount,remain:(total.quotaRouterCount - used.routerCount)});
    this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Load Balancer",total: total.quotaLoadBalancerSDNCount,used: used.loadBalancerSdnCount,remain:(total.quotaLoadBalancerSDNCount - used.loadBalancerSdnCount)});
    this.listOfData.push({name : this.i18n.fanyi('app.capacity') + " File System (GB)",total: total.quotaShareInGb + " GB",used:  "NON GB",remain:"10" + " GB"});
    this.listOfData.push({name : this.i18n.fanyi('app.capacity') + " File System Snapshot (GB)",total:total.quotaShareSnapshotInGb + " GB",used:used.quotaShareSnapshotInGb + " GB",remain:(total.quotaShareSnapshotInGb - used.quotaShareSnapshotInGb) + " GB"});
    this.percentCpu = (used.cpu/total.quotavCpu)*100;
    this.percentRam = (used.ram/total.quotaRamInGb)*100;
    this.percentHHD = (used.hdd/total.quotaHddInGb)*100;
    this.percentSSD = (used.ssd/total.quotaSSDInGb)*100;
    this.percentIPFloating = (used.ssd/total.quotaSSDInGb)*100;
    this.percentBackup = (used.backup/total.quotaBackupVolumeInGb)*100;
  }

  extendVpc() {
    const requestBody = {
      regionId: this.regionId,
      serviceName: this.data && this.data.displayName,
      customerId: this.tokenService.get()?.userId,
      typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VpcExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
      serviceType: 12,
      actionType: 3,
      serviceInstanceId: this.activatedRoute.snapshot.paramMap.get('id'),
      newExpireDate: this.expiredDate,
      userEmail: null,
      actorEmail: null
    }
    const request = {
      customerId: this.tokenService.get()?.userId,
      createdByUserId: this.tokenService.get()?.userId,
      note: "Gia hạn VPC",
      orderItems: [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(requestBody),
          specificationType: "vpc_extend",
          price: this.total?.data?.totalAmount.amount/this.form.controls['numOfMonth'].value,
          // serviceDuration: this.form.controls['numOfMonth'].value
          serviceDuration: this.timeSelected
        }
      ]
    }
    this.orderService.validaterOrder(request).subscribe(
      (data) => {
        if (data.success) {
          console.log('request', request);
           var returnPath: string = window.location.pathname;
            this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request,path: returnPath } });
        } else {
          this.isVisiblePopupError = true;
          this.errorList = data.data;
        }
      },
      (error) => {
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          error.error.detail
        );
      }
    );
    // var returnPath: string = window.location.pathname;
    // this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request,path: returnPath } });
  }

  // onChangeTime() {
  //   const dateNow =new Date(this.expiredDateOld);
  //   console.log("datenow1", dateNow)
  //   dateNow.setDate(dateNow.getDate() + Number(this.form.controls['numOfMonth'].value) * 30);
  //   console.log("dtaenow2", dateNow)
  //   this.expiredDate = dateNow;
  //   this.caculate();
  // }

  onChangeTime(value:any) {

    this.timeSelected = value
    console.log("timeSelected", this.timeSelected)
    this.caculate();


  }

  private caculate() {
    const requestBody = {
      regionId: this.regionId,
      serviceName: null,
      customerId: this.tokenService.get()?.userId,
      typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.VpcExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
      serviceType: 12,
      actionType: 3,
      serviceInstanceId: this.activatedRoute.snapshot.paramMap.get('id'),
      newExpireDate: this.expiredDate,
      userEmail: null,
      actorEmail: null
    }
    const request = {
      customerId: this.tokenService.get()?.userId,
      createdByUserId: this.tokenService.get()?.userId,
      note: "Gia hạn VPC",
      orderItems: [
        {
          orderItemQuantity: 1,
          specificationString: JSON.stringify(requestBody),
          specificationType: "vpc_extend",
          price: 0,
          // serviceDuration: this.form.controls['numOfMonth'].value
          serviceDuration: this.timeSelected 
        }
      ]
    }

    this.ipService.getTotalAmount(request)
      .pipe(finalize(() => {
        this.loadingCalculate = false;
      }))
      .subscribe(
        data => {
          this.total = data;
          console.log("total 123", this.total)
          this.totalAmount = this.total.data.totalAmount.amount;
          this.totalVAT = this.total.data.totalVAT.amount;
          this.totalPayment = this.total.data.totalPayment.amount;
        }
      );
  }
}
