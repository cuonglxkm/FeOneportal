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
  loading = true;
  todayNow: Date;
  totalUsed: TotalUsedModel;
  totalLimit: TotalLimitModel;
  totalGpu: { gpuOfferId: number, totalLimitGpu: number, totalUsedGpu: number, gpuType: string }[] = [];

  serviceActiveByRegion: SupportService[] = [];
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
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.regionId = RegionID.NORMAL;
      } else {
        this.regionId = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.regionId = RegionID.ADVANCE;
    }
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getData(id);
    this.todayNow = new Date();
    this.checkExpireDate()

    this.getProductActivebyregion();

  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.router.navigate(['/app-smart-cloud/project'])
    this.navigateToRegion();
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
            // this.router.navigate(['/app-smart-cloud/project']);
            this.navigateToRegion();
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
          console.log("object dataTotal", this.dataTotal)
          this.totalLimit = data.cloudProject;
          console.log("totalLimit", this.totalLimit)
          this.totalUsed = data.cloudProjectResourceUsed;
          console.log("totalUsed", this.totalUsed)

          this.percentCpu = Math.round((this.totalUsed.cpu / this.totalLimit.quotavCpu) * 100)
          this.percentRam = Math.round((this.totalUsed.ram / this.totalLimit.quotaRamInGb) * 100)
          this.percentHHD = Math.round((this.totalUsed.hdd / this.totalLimit.quotaHddInGb) * 100)
          this.percentSSD = Math.round((this.totalUsed.ssd / this.totalLimit.quotaSSDInGb) * 100)
          this.percentIPFloating = Math.round((this.totalUsed.ipFloatingCount / this.totalLimit.quotaIpFloatingCount) * 100)
          this.percentBackup = Math.round((this.totalUsed.backup / this.totalLimit.quotaBackupVolumeInGb) * 100)


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
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/project/update-advance/' + this.activatedRoute.snapshot.paramMap.get('id')])
      // this.router.navigate(['/app-smart-cloud/project-advance'])
    } else {
      this.router.navigate(['/app-smart-cloud/project/update/' + this.activatedRoute.snapshot.paramMap.get('id')])
    }
   
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
    const catalogs = ['ip', 'ipv6', 'volume-snapshot-hdd', 'volume-snapshot-ssd', 'backup-volume', 'loadbalancer-sdn', 'file-storage', 'file-storage-snapshot', 'vpns2s', 'vm-gpu']
    this.catalogService.getActiveServiceByRegion(catalogs, this.regionId).subscribe(data => {
      this.serviceActiveByRegion = data;
      this.serviceActiveByRegion.forEach((item: any) => {
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
  navigateToRegion(){
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/project-advance'])
    } else {
      this.router.navigate(['/app-smart-cloud/project'])
    }
  }

}
