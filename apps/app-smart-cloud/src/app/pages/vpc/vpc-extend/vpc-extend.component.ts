import {Component, Inject} from '@angular/core';
import {TotalVpcResource, VpcModel} from "../../../shared/models/vpc.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {VpcService} from "../../../shared/services/vpc.service";
import {ActivatedRoute, Router} from "@angular/router";
import {getCurrentRegionAndProject} from "@shared";
import {RegionModel} from "../../../shared/models/region.model";
import {finalize} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'one-portal-vpc-extend',
  templateUrl: './vpc-extend.component.html',
  styleUrls: ['./vpc-extend.component.less'],
})
export class VpcExtendComponent {
  regionId: any;
  listOfData = [];
  data: VpcModel;
  dataTotal: TotalVpcResource;
  percentCpu: number = 0;
  percentRam: number = 0;
  percentHHD: number = 0;
  percentSSD: number = 0;
  percentIPFloating: number = 0;
  percentBackup: number = 0;
  totalAmount = 0;
  totalPayment = 0;
  loadingCalculate= false;
  form = new FormGroup({
    name: new FormControl('', {validators: [Validators.required]}),
    description: new FormControl(''),

    ipConnectInternet: new FormControl('', {validators: [Validators.required]}),
    numOfMonth: new FormControl(1, {validators: [Validators.required]}),
    hhd: new FormControl(0),
    ssd: new FormControl(0),

  });
  today = new Date();
  expiredDate = new Date();

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private service: VpcService,
              private router: Router,
              private activatedRoute: ActivatedRoute,) {
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getData(id);
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.router.navigate(['/app-smart-cloud/vpc'])
  }

  private getData(id: any) {
    this.service.getDetail(id)
      .subscribe(
        data => {
          this.data = data;
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
    let total = this.dataTotal.cloudProject;
    let used = this.dataTotal.cloudProjectResourceUsed;
    this.listOfData.push({name : "CPU (vCPU)",total: total.quotavCpu + " vCPU",used:used.cpu + " vCPU",remain: (total.quotavCpu - used.cpu) + " vCPU"});
    this.listOfData.push({name : "RAM (GB)",total: total.quotaRamInGb + " GB",used:used.ram + " GB",remain:(total.quotaRamInGb - used.ram) + " GB"});
    this.listOfData.push({name : "HHD (GB)",total: total.quotaHddInGb + " GB",used:used.hdd + " GB",remain:(total.quotaHddInGb - used.hdd) + " GB"});
    this.listOfData.push({name : "SSD (GB)",total: total.quotaSSDInGb + " GB",used:used.ssd + " GB",remain:(total.quotaSSDInGb - used.ssd) + " GB"});
    this.listOfData.push({name : "Dung lượng Backup Volume/VN(GB)", total:total.quotaBackupVolumeInGb + " GB",used:used.backup + " GB",remain: (total.quotaBackupVolumeInGb - used.backup) + " GB"});
    this.listOfData.push({name : "Số lượng IP Floating",total: total.quotaIpFloatingCount,used:"NON",remain:"10"});
    this.listOfData.push({name : "Số lượng IP Public",total:total.quotaIpPublicCount,used:used.ipPublicCount,remain: (total.quotaIpPublicCount - used.ipPublicCount)});
    this.listOfData.push({name : "Số lượng IPv6",total:total.quotaIpv6Count,used:used.ipv6Count,remain:(total.quotaIpv6Count - used.ipv6Count)});
    this.listOfData.push({name : "Số lượng Network",total: total.quotaNetworkCount,used:used.networkCount,remain:(total.quotaNetworkCount - used.networkCount)});
    this.listOfData.push({name : "Số lượng Security Group",total: total.quotaSecurityGroupCount,used:used.securityGroupCount,remain:(total.quotaSecurityGroupCount - used.securityGroupCount)});
    this.listOfData.push({name : "Số lượng Router",total: total.quotaRouterCount,used:used.routerCount,remain:(total.quotaRouterCount - used.routerCount)});
    this.listOfData.push({name : "Số lượng Load Balancer",total: total.quotaLoadBalancerSDNCount,used: used.loadBalancerSdnCount,remain:(total.quotaLoadBalancerSDNCount - used.loadBalancerSdnCount)});
    this.listOfData.push({name : "Dung lương File System (GB)",total: total.quotaShareInGb + " GB",used:  "NON GB",remain:"10" + " GB"});
    this.listOfData.push({name : "Dung lượng File System Snapshot (GB)",total:total.quotaShareSnapshotInGb + " GB",used:used.quotaShareSnapshotInGb + " GB",remain:(total.quotaShareSnapshotInGb - used.quotaShareSnapshotInGb) + " GB"});
    this.percentCpu = (used.cpu/total.quotavCpu)*100;
    this.percentRam = (used.ram/total.quotaRamInGb)*100;
    this.percentHHD = (used.hdd/total.quotaHddInGb)*100;
    this.percentSSD = (used.ssd/total.quotaSSDInGb)*100;
    this.percentIPFloating = 23;
    this.percentBackup = (used.backup/total.quotaBackupVolumeInGb)*100;
  }

  createIpPublic() {

  }

  onChangeTime() {
    const dateNow = new Date();
    dateNow.setMonth(dateNow.getMonth() + Number(this.form.controls['numOfMonth'].value));
    this.expiredDate = dateNow;
  }
}
