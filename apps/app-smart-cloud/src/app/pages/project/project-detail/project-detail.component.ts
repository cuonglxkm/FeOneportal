import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {InstancesService} from "../../instances/instances.service";
import {ActivatedRoute, Router} from "@angular/router";
import {IpPublicService} from "../../../shared/services/ip-public.service";
import {getCurrentRegionAndProject} from "@shared";
import {VpcService} from "../../../shared/services/vpc.service";
import {TotalVpcResource, VpcModel,TotalUsedModel,TotalLimitModel} from "../../../shared/models/vpc.model";
import {finalize} from "rxjs";
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.less'],
})
export class ProjectDetailComponent implements OnInit{
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
  todayNow:Date;
  totalUsed:TotalUsedModel;
  totalLimit:TotalLimitModel;
  totalGpu: { gpuOfferId: number, totalLimitGpu: number, totalUsedGpu: number,gpuType: string}[] = [];

  productByRegion:any
  catalogStatus: { [key: string]: boolean } = {};
  catalogs: string[] = ['ip', 'ipv6','volume-snapshot-hdd', 'volume-snapshot-ssd', 'backup-volume', 'loadbalancer-sdn', 'file-storage','file-storage-snapshot', 'vpns2s','vm-gpu'];

  formatDone = (): string => `100%`;
  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private service: VpcService,
              private router: Router,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private activatedRoute: ActivatedRoute,private vpc:VpcService) {
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getData(id);
    this.todayNow = new Date();
    this.checkExpireDate()

    this.catalogs.forEach(catalog => {
      this.getProductActivebyregion(catalog, this.regionId);
    });
   
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.router.navigate(['/app-smart-cloud/project'])
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
  }
isAdjust:boolean= true;
  private getData(id: any) {
   
    this.loading = true;
    this.service.getDetail(id)
      .subscribe(
      data => {
        this.data = data;
        console.log("huuu", this.data)
        // const today = this.parseDate(this.todayNow);
        // console.log("today", this.todayNow)
        //  const expireDate = this.parseDate(this.data?.expireDate);
        // const expireDate: string = this.getCurrentDateTime(this.data?.expireDate);
        // 
        const expireDate1 = new Date(this.data?.expireDate)
        // console.log("expireDate", expireDate1)
        const expireDateTime:string = this.getCurrentDateTime(expireDate1);
        // console.log("expireDateTime", expireDateTime)
        const currentDateTime: string = this.getCurrentDateTime(this.todayNow);
        // console.log("currentDateTime",currentDateTime); // Output: "15:30:45 06/09/2024"

        if(expireDateTime<currentDateTime){
          this.isAdjust= false
        }
        else{
          this.isAdjust= true
        }
        this.loading = false;

      }
    )
   
    this.service.getTotalResouce(id)
      .pipe(finalize(() => {
        // this.pushTable();
      }))
      .subscribe(
      data => {
        this.dataTotal = data;
        console.log("object dataTotal", this.dataTotal)
        this.totalLimit = data.cloudProject;
        console.log("totalLimit", this.totalLimit)
        this.totalUsed = data.cloudProjectResourceUsed;
        console.log("totalUsed", this.totalUsed)

        this.percentCpu =  Math.round((this.totalUsed.cpu/ this.totalLimit.quotavCpu)*100)
        this.percentRam = Math.round((this.totalUsed.ram/ this.totalLimit.quotaRamInGb)*100)
        this.percentHHD = Math.round((this.totalUsed.hdd/ this.totalLimit.quotaHddInGb)*100)
        this.percentSSD = Math.round((this.totalUsed.ssd/ this.totalLimit.quotaSSDInGb)*100)
        this.percentIPFloating = Math.round((this.totalUsed.ipFloatingCount/ this.totalLimit.quotaIpFloatingCount)*100)
        this.percentBackup = Math.round((this.totalUsed.backup/ this.totalLimit.quotaBackupVolumeInGb)*100)
        
       
        this.totalLimit?.gpuProjects.forEach((limitGpu:any) => {       
          const matchingAvailableGpu =  this.totalUsed.gpuUsages.find((availGpu:any) => availGpu.gpuOfferId== limitGpu.gpuOfferId );        
          if (matchingAvailableGpu) {
            this.totalGpu.push({
              gpuOfferId: limitGpu?.gpuOfferId,
              totalLimitGpu: limitGpu?.gpuCount,
              totalUsedGpu: matchingAvailableGpu.gpuCount,
              gpuType: limitGpu?.gpuType,
              });   
          }
          else{
            this.totalGpu.push({
              gpuOfferId: limitGpu?.gpuOfferId,
              totalLimitGpu: limitGpu?.gpuCount,
              totalUsedGpu:0,
              gpuType: limitGpu?.gpuType,
              });  
          }
          
      });

      }
    )
  }
  // formatDone = (percent: number): string => {
  //   return percent === 100 ? '100%' : `${percent}%`;
  // };

  // private pushTable() {
  //   this.listOfData = [];
  //   let total = this.dataTotal.cloudProject;
  //   let used = this.dataTotal.cloudProjectResourceUsed;
  //   this.listOfData.splice(0,1)
  //   if (this.data.type == 'VPC') {
  //     this.listOfData.push({name : "CPU (vCPU)",total: total.quotavCpu + " vCPU",used:used.cpu + " vCPU",remain: (total.quotavCpu - used.cpu) + " vCPU"});
  //     this.listOfData.push({name : "RAM (GB)",total: total.quotaRamInGb + " GB",used:used.ram + " GB",remain:(total.quotaRamInGb - used.ram) + " GB"});
  //     this.listOfData.push({name : "HDD (GB)",total: total.quotaHddInGb + " GB",used:used.hdd + " GB",remain:(total.quotaHddInGb - used.hdd) + " GB"});
  //     this.listOfData.push({name : "SSD (GB)",total: total.quotaSSDInGb + " GB",used:used.ssd + " GB",remain:(total.quotaSSDInGb - used.ssd) + " GB"});
  //     this.listOfData.push({name : "Dung lượng Backup Volume/VN(GB)", total:total.quotaBackupVolumeInGb + " GB",used:used.backup + " GB",remain: (total.quotaBackupVolumeInGb - used.backup) + " GB"});
  //     this.listOfData.push({name : this.i18n.fanyi('app.amount') + " IP Floating",total: total.quotaIpFloatingCount,used:used.ipFloatingCount,remain:(total.quotaIpFloatingCount - used.ipFloatingCount)});
  //     this.listOfData.push({name : this.i18n.fanyi('app.amount') + " IP Public",total:total.quotaIpPublicCount,used:used.ipPublicCount,remain: (total.quotaIpPublicCount - used.ipPublicCount)});
  //     this.listOfData.push({name : this.i18n.fanyi('app.amount') + " IPv6",total:total.quotaIpv6Count,used:used.ipv6Count,remain:(total.quotaIpv6Count - used.ipv6Count)});
  //     this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Network",total: total.quotaNetworkCount,used:used.networkCount,remain:(total.quotaNetworkCount - used.networkCount)});
  //     this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Security Group",total: total.quotaSecurityGroupCount,used:used.securityGroupCount,remain:(total.quotaSecurityGroupCount - used.securityGroupCount)});
  //     this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Router",total: total.quotaRouterCount,used:used.routerCount,remain:(total.quotaRouterCount - used.routerCount)});
  //     this.listOfData.push({name : this.i18n.fanyi('app.amount') + " Load Balancer",total: total.quotaLoadBalancerSDNCount,used: used.loadBalancerSdnCount,remain:(total.quotaLoadBalancerSDNCount - used.loadBalancerSdnCount)});
  //     this.listOfData.push({name : this.i18n.fanyi('app.capacity') + " File System (GB)",total: total.quotaShareInGb + " GB",used: used.quotaShareInGb + " GB",remain:(total.quotaShareInGb - used.quotaShareInGb) + " GB"});
  //     this.listOfData.push({name : this.i18n.fanyi('app.capacity') + " File System Snapshot (GB)",total:total.quotaShareSnapshotInGb + " GB",used:used.quotaShareSnapshotInGb + " GB",remain:(total.quotaShareSnapshotInGb - used.quotaShareSnapshotInGb) + " GB"});
  //     // this.percentCpu =   (used.cpu/total.quotavCpu)*100;
  //     // this.percentRam =(used.ram/total.quotaRamInGb)*100;
  //     // this.percentHHD =(used.hdd/total.quotaHddInGb)*100;
  //     // this.percentSSD = (used.ssd/total.quotaSSDInGb)*100;
  //     // this.percentIPFloating = (used.ssd/total.quotaSSDInGb)*100;
  //     // this.percentBackup =(used.backup/total.quotaBackupVolumeInGb)*100;
  //   } else {
  //     this.listOfData.push({name : "Networks",total: total.quotaNetworkCount,used:used.networkCount,remain:(total.quotaNetworkCount - used.networkCount)});
  //     this.listOfData.push({name : "Security Group",total: total.quotaSecurityGroupCount,used:used.securityGroupCount,remain:(total.quotaSecurityGroupCount - used.securityGroupCount)});
  //     this.listOfData.push({name : "Routers",total: total.quotaRouterCount,used:used.routerCount,remain:(total.quotaRouterCount - used.routerCount)});
  //   }

  //   this.loading = false;
  // }

  edit() {
    this.router.navigate(['/app-smart-cloud/project/update/' + this.activatedRoute.snapshot.paramMap.get('id')])
  }

  extend() {
    this.router.navigate(['/app-smart-cloud/project/extend/' + this.activatedRoute.snapshot.paramMap.get('id')])
  }
  parseDate(dateInput:string | Date):Date{
    if(dateInput instanceof Date){
      return dateInput;
    }
    else{
      const [time, date] = dateInput.split(' ');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      const [day, month, year] = date.split('/').map(Number);
      return new Date(year, month - 1, day, hours, minutes, seconds);
    }
    
  }
  checkExpireDate(){
//  const today = this.parseDate(this.todayNow);
//  console.log("today", this.todayNow)
//   const expireDate = this.parseDate(this.data?.expireDate);
//   console.log("expireDate",expireDate)
// console.log("this.data?.expireDate",this.data?.expireDate)

  }
 
   getCurrentDateTime( date:any): string {
   
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    return date.toLocaleString('en-US', options);
}
getProductActivebyregion(catalog:string, regionid:number){
  this.vpc.getProductActivebyregion(catalog, regionid).subscribe((res: any) => {
    this.productByRegion = res
    this.catalogStatus[catalog] = this.productByRegion.some(product => product.isActive === true);

  })
}

}
