import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {InstancesService} from "../../instances/instances.service";
import {ActivatedRoute, Router} from "@angular/router";
import {IpPublicService} from "../../../shared/services/ip-public.service";
import {getCurrentRegionAndProject} from "@shared";
import {VpcService} from "../../../shared/services/vpc.service";
import {TotalVpcResource, VpcModel} from "../../../shared/models/vpc.model";
import {finalize} from "rxjs";
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-vpc-detail',
  templateUrl: './vpc-detail.component.html',
  styleUrls: ['./vpc-detail.component.less'],
})
export class VpcDetailComponent implements OnInit{
  regionId: any;
  listOfData = [
    {}
  ];
  data: VpcModel;
  dataTotal: TotalVpcResource;
  percentCpu: number = 0;
  percentRam: number = 0;
  percentHHD: number = 0;
  percentSSD: number = 0;
  percentIPFloating: number = 0;
  percentBackup: number = 0;
  loading = true;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private service: VpcService,
              private router: Router,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
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
    this.loading = true;
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
    this.listOfData = [];
    let total = this.dataTotal.cloudProject;
    let used = this.dataTotal.cloudProjectResourceUsed;
    this.listOfData.splice(0,1)
    if (this.data.type == 'VPC') {
      this.listOfData.push({name : "CPU (vCPU)",total: total.quotavCpu + " vCPU",used:used.cpu + " vCPU",remain: (total.quotavCpu - used.cpu) + " vCPU"});
      this.listOfData.push({name : "RAM (GB)",total: total.quotaRamInGb + " GB",used:used.ram + " GB",remain:(total.quotaRamInGb - used.ram) + " GB"});
      this.listOfData.push({name : "HHD (GB)",total: total.quotaHddInGb + " GB",used:used.hdd + " GB",remain:(total.quotaHddInGb - used.hdd) + " GB"});
      this.listOfData.push({name : "SSD (GB)",total: total.quotaSSDInGb + " GB",used:used.ssd + " GB",remain:(total.quotaSSDInGb - used.ssd) + " GB"});
      this.listOfData.push({name : "Dung lượng Backup Volume/VN(GB)", total:total.quotaBackupVolumeInGb + " GB",used:used.backup + " GB",remain: (total.quotaBackupVolumeInGb - used.backup) + " GB"});
      this.listOfData.push({name : this.i18n.fanyi('app.amount') + " IP Floating",total: total.quotaIpFloatingCount,used:used.ipFloatingCount,remain:(total.quotaIpFloatingCount - used.ipFloatingCount)});
      this.listOfData.push({name : this.i18n.fanyi('app.amount') + " IP Public",total:total.quotaIpPublicCount,used:used.ipPublicCount,remain: (total.quotaIpPublicCount - used.ipPublicCount)});
      this.listOfData.push({name : this.i18n.fanyi('app.amount') + " IPv6",total:total.quotaIpv6Count,used:used.ipv6Count,remain:(total.quotaIpv6Count - used.ipv6Count)});
      this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Network",total: total.quotaNetworkCount,used:used.networkCount,remain:(total.quotaNetworkCount - used.networkCount)});
      this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Security Group",total: total.quotaSecurityGroupCount,used:used.securityGroupCount,remain:(total.quotaSecurityGroupCount - used.securityGroupCount)});
      this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Router",total: total.quotaRouterCount,used:used.routerCount,remain:(total.quotaRouterCount - used.routerCount)});
      this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Load Balancer",total: total.quotaLoadBalancerSDNCount,used: used.loadBalancerSdnCount,remain:(total.quotaLoadBalancerSDNCount - used.loadBalancerSdnCount)});
      this.listOfData.push({name : this.i18n.fanyi('app.capacity') + " File System (GB)",total: total.quotaShareInGb + " GB",used: used.quotaShareInGb + " GB",remain:(total.quotaShareInGb - used.quotaShareInGb) + " GB"});
      this.listOfData.push({name : this.i18n.fanyi('app.capacity') + " File System Snapshot (GB)",total:total.quotaShareSnapshotInGb + " GB",used:used.quotaShareSnapshotInGb + " GB",remain:(total.quotaShareSnapshotInGb - used.quotaShareSnapshotInGb) + " GB"});
      this.percentCpu = (used.cpu/total.quotavCpu)*100;
      this.percentRam = (used.ram/total.quotaRamInGb)*100;
      this.percentHHD = (used.hdd/total.quotaHddInGb)*100;
      this.percentSSD = (used.ssd/total.quotaSSDInGb)*100;
      this.percentIPFloating = 23;
      this.percentBackup = (used.backup/total.quotaBackupVolumeInGb)*100;
    } else {
      this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Network",total: total.quotaNetworkCount,used:used.networkCount,remain:(total.quotaNetworkCount - used.networkCount)});
      this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Security Group",total: total.quotaSecurityGroupCount,used:used.securityGroupCount,remain:(total.quotaSecurityGroupCount - used.securityGroupCount)});
    }

    this.loading = false;
  }

  edit() {
    this.router.navigate(['/app-smart-cloud/vpc/update/' + this.activatedRoute.snapshot.paramMap.get('id')])
  }

  extend() {
    this.router.navigate(['/app-smart-cloud/vpc/extend/' + this.activatedRoute.snapshot.paramMap.get('id')])
  }
}
