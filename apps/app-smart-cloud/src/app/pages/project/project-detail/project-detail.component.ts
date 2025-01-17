import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { InstancesService } from "../../instances/instances.service";
import { ActivatedRoute, Router } from "@angular/router";
import { IpPublicService } from "../../../shared/services/ip-public.service";
import { getCurrentRegionAndProject } from "@shared";
import { VpcService } from "../../../shared/services/vpc.service";
import { TotalVpcResource, VpcModel, TotalUsedModel, TotalLimitModel } from "../../../shared/models/vpc.model";
import { finalize } from "rxjs";
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { SupportService } from 'src/app/shared/models/catalog.model';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { error } from 'console';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.less'],
})
export class ProjectDetailComponent implements OnInit {
  regionId: any;
  region = JSON.parse(localStorage.getItem('regionId'));
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
  percentIpPublic: number = 0;
  percentIpv6: number = 0;
  percentNetwork: number = 0;
  percentSecurityGroup: number = 0;
  percentRouter: number = 0;
  
  loading = true;
  todayNow: Date;
  totalUsed: TotalUsedModel;
  totalLimit: TotalLimitModel;
  totalGpu: { gpuOfferId: number, totalLimitGpu: number, totalUsedGpu: number, gpuType: string }[] = [];

  serviceActiveByRegion: SupportService[] = [];
  typeHdd:boolean;
  typeSsd:boolean;
  typeIp: boolean;
  typeIpv6: boolean;
  typeVolume_snapshot_hdd: boolean;
  typeVolume_snapshot_ssd: boolean;
  typeBackup_volume: boolean;
  typeLoadbalancer_sdn: boolean;
  typeFile_storage: boolean;
  typeFile_storage_snapshot: boolean;
  typeVpns2s: boolean;
  typeVm_gpu: boolean;
  url = window.location.pathname;
  selectedPlatform:string='k8s';
  listPlatformService=[
    {label:'VNPT Kubernetes Service',value:'k8s' },
  {label:'VNPT Streaming For Kafka', value:'kafka'},
{label:'VNPT DocumentDB for MongoDB', value:'mongodb'}]

  formatDone = (): string => `100%`;
  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private service: VpcService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private activatedRoute: ActivatedRoute,
    private vpc: VpcService,
    private catalogService: CatalogService,
    private notification: NzNotificationService
  ) {
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
   
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getData(id);
    this.todayNow = new Date();
    this.checkExpireDate()

    this.getProductActivebyregion();
    

  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.router.navigate(['/app-smart-cloud/project'])
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
  }
  isAdjust: boolean = true;
  private getData(id: any) {

    this.loading = true;
    this.service.getDetail(id)
      .subscribe(
        data => {
          this.data = data;
        console.log("region chi tiết", this.regionId)
          const expireDate1 = new Date(this.data?.expireDate)
          const expireDateTime: string = this.getCurrentDateTime(expireDate1);
          const currentDateTime: string = this.getCurrentDateTime(this.todayNow);

          if (expireDateTime < currentDateTime) {
            this.isAdjust = false
          }
          else {
            this.isAdjust = true
          }
          this.loading = false;

        }, error => {

          if (error.status === 500) {
            this.router.navigate(['/app-smart-cloud/project']);
            this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi(error.error.message));
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
          this.totalLimit = data.cloudProject;
          this.totalUsed = data.cloudProjectResourceUsed;
          this.percentCpu = Math.round((this.totalUsed.cpu / this.totalLimit.quotavCpu) * 100)
          this.percentRam = Math.round((this.totalUsed.ram / this.totalLimit.quotaRamInGb) * 100)
          this.percentHHD = Math.round((this.totalUsed.hdd / this.totalLimit.quotaHddInGb) * 100)
          this.percentSSD = Math.round((this.totalUsed.ssd / this.totalLimit.quotaSSDInGb) * 100)
          this.percentIPFloating = Math.round((this.totalUsed.ipFloatingCount / this.totalLimit.quotaIpFloatingCount) * 100)
          this.percentBackup = Math.round((this.totalUsed.backup / this.totalLimit.quotaBackupVolumeInGb) * 100)

          this.percentIpPublic = Math.round((this.totalUsed.ipPublicCount / this.totalLimit.quotaIpPublicCount) * 100)
          this.percentIpv6= Math.round((this.totalUsed.ipv6Count/this.totalLimit.quotaIpv6Count)*100)
          this.percentNetwork = Math.round((this.totalUsed.networkCount / this.totalLimit.quotaNetworkCount) * 100)
          this.percentSecurityGroup = Math.round((this.totalUsed.securityGroupCount / this.totalLimit.quotaSecurityGroupCount) * 100)
          this.percentRouter = Math.round((this.totalUsed.routerCount / this.totalLimit.quotaRouterCount) * 100)

          
          this.totalLimit?.gpuProjects.forEach((limitGpu: any) => {
            const matchingAvailableGpu = this.totalUsed.gpuUsages.find((availGpu: any) => availGpu.gpuOfferId == limitGpu.gpuOfferId);
            if (matchingAvailableGpu) {
              this.totalGpu.push({
                gpuOfferId: limitGpu?.gpuOfferId,
                totalLimitGpu: limitGpu?.gpuCount,
                totalUsedGpu: matchingAvailableGpu.gpuCount,
                gpuType: limitGpu?.gpuType,
              });
            }
            else {
              this.totalGpu.push({
                gpuOfferId: limitGpu?.gpuOfferId,
                totalLimitGpu: limitGpu?.gpuCount,
                totalUsedGpu: 0,
                gpuType: limitGpu?.gpuType,
              });
            }

          });

        }
      )
  }


  edit() {
    this.router.navigate(['/app-smart-cloud/project/update/' + this.activatedRoute.snapshot.paramMap.get('id')])
  }

  extend() {
    this.router.navigate(['/app-smart-cloud/project/extend/' + this.activatedRoute.snapshot.paramMap.get('id')])
  }
  parseDate(dateInput: string | Date): Date {
    if (dateInput instanceof Date) {
      return dateInput;
    }
    else {
      const [time, date] = dateInput.split(' ');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      const [day, month, year] = date.split('/').map(Number);
      return new Date(year, month - 1, day, hours, minutes, seconds);
    }

  }
  checkExpireDate() {

  }

  getCurrentDateTime(date: any): string {

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


  getProductActivebyregion() {
    const catalogs = ['volume-hdd','volume-ssd','ip', 'ipv6', 'volume-snapshot-hdd', 'volume-snapshot-ssd', 'backup-volume', 'loadbalancer-sdn', 'file-storage', 'file-storage-snapshot', 'vpns2s', 'vm-gpu']
    this.catalogService.getActiveServiceByRegion(catalogs, this.regionId).subscribe(data => {
      console.log("region 1234 Huyn", this.regionId)
      this.serviceActiveByRegion = data;
      this.serviceActiveByRegion.forEach((item: any) => {
        if (['volume-hdd'].includes(item.productName)) {
          this.typeHdd = item.isActive;
        }
        if (['volume-ssd'].includes(item.productName)) {
          this.typeSsd = item.isActive;
        }
        if (['ip'].includes(item.productName)) {
          this.typeIp = item.isActive;
        }
        if (['ipv6'].includes(item.productName)) {
          this.typeIpv6 = item.isActive;
        }
        if (['volume-snapshot-hdd'].includes(item.productName)) {
          this.typeVolume_snapshot_hdd = item.isActive;
        }
        if (['volume-snapshot-ssd'].includes(item.productName)) {
          this.typeVolume_snapshot_ssd = item.isActive;
        }
        if (['backup-volume'].includes(item.productName)) {
          this.typeBackup_volume = item.isActive;
          console.log("typeBackup_volume", this.typeBackup_volume);
        }
        if (['loadbalancer-sdn'].includes(item.productName)) {
          this.typeLoadbalancer_sdn = item.isActive;
        }
        if (['file-storage'].includes(item.productName)) {
          this.typeFile_storage = item.isActive;
        }
        if (['file-storage-snapshot'].includes(item.productName)) {
          this.typeFile_storage_snapshot = item.isActive;
        }
        if (['vpns2s'].includes(item.productName)) {
          this.typeVpns2s = item.isActive;
        }
        if (['vm-gpu'].includes(item.productName)) {
          this.typeVm_gpu = item.isActive;
        }
      });
    });
  }
  changePlaftform(value:string){
    this.selectedPlatform = value
  }
  // navigateToRegion(){
  //   if (this.region === RegionID.ADVANCE) {
  //     this.router.navigate(['/app-smart-cloud/project-advance'])
  //   } else {
  //     this.router.navigate(['/app-smart-cloud/project'])
  //   }
  // }

}
