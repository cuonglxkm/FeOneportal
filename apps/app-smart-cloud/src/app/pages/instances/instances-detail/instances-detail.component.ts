import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  BlockStorageAttachments,
  InstancesModel,
  Network,
  SecurityGroupModel,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InstancesService } from '../instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { G2TimelineData } from '@delon/chart/timeline';
import { RegionModel } from 'src/app/shared/models/region.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-instances-detail',
  templateUrl: './instances-detail.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstancesDetailComponent implements OnInit {
  loading = true;

  instancesModel: InstancesModel;
  id: number;
  listSecurityGroupModel: SecurityGroupModel[] = [];

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private route: Router,
    public message: NzMessageService
  ) {}

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = `0${date.getUTCMonth() + 1}`.slice(-2);
    const day = `0${date.getUTCDate()}`.slice(-2);
    const hours = `0${date.getUTCHours()}`.slice(-2);
    const minutes = `0${date.getUTCMinutes()}`.slice(-2);
    const seconds = `0${date.getUTCSeconds()}`.slice(-2);
    const milliseconds = `00${date.getUTCMilliseconds()}`.slice(-3);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  }

  ngOnInit(): void {
    this.router.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.getBlockStorage();
        this.dataService.getById(this.id, true).subscribe((data: any) => {
          this.instancesModel = data;
          this.loading = false;
          this.cloudId = this.instancesModel.cloudId;
          this.regionId = this.instancesModel.regionId;
          this.getListIpPublic();
          this.getMonitorData();
          this.dataService
            .getAllSecurityGroupByInstance(
              this.cloudId,
              this.regionId,
              this.instancesModel.customerId,
              this.instancesModel.projectId
            )
            .subscribe((datasg: any) => {
              this.listSecurityGroupModel = datasg;
              this.cdr.detectChanges();
            });
          this.cdr.detectChanges();
        });
      }
    });
  }

  listIPPublicStr = '';
  listIPLanStr = '';
  getListIpPublic() {
    this.dataService
      .getPortByInstance(this.id, this.regionId)
      .subscribe((dataNetwork: any) => {
        //list IP public
        let listOfPublicNetwork: Network[] = dataNetwork.filter(
          (e: Network) => e.isExternal == true
        );
        let listIPPublic: string[] = [];
        listOfPublicNetwork.forEach((e) => {
          listIPPublic = listIPPublic.concat(e.fixedIPs);
        });
        this.listIPPublicStr = listIPPublic.join(', ');

        //list IP Lan
        let listOfPrivateNetwork: Network[] = dataNetwork.filter(
          (e: Network) => e.isExternal == false
        );
        let listIPLan: string[] = [];
        listOfPrivateNetwork.forEach((e) => {
          listIPLan = listIPLan.concat(e.fixedIPs);
        });
        this.listIPLanStr = listIPLan.join(', ');
        this.cdr.detectChanges();
      });
  }

  listOfDataBlockStorage: BlockStorageAttachments[] = [];
  volumeRootType: string;
  getBlockStorage() {
    this.dataService
      .getBlockStorage(this.id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfDataBlockStorage = data;
        this.listOfDataBlockStorage.forEach((e) => {
          if (e.bootable) {
            if (e.volumeType == 'ssd') {
              this.volumeRootType = 'SSD';
            } else {
              this.volumeRootType = 'HDD';
            }
          }
        });
        this.cdr.detectChanges();
      });
  }

  onRegionChange(region: RegionModel) {
    this.route.navigate(['/app-smart-cloud/instances']);
  }

  userChangeProject() {
    this.route.navigate(['/app-smart-cloud/instances']);
  }

  navigateToEdit() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit/' + this.id,
    ]);
  }

  navigateToChangeImage() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.id,
    ]);
  }

  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/instances']);
  }

  //Giám sát
  activeGS: boolean = false;
  maxAxis = 1;
  cahrt = [];
  valueGSCPU: string = 'cpu';
  valueGSTIME: number = 5;
  cloudId: string;
  regionId: number;
  projectId: number;
  chartData: G2TimelineData[] = [];

  GSCPU = [
    {
      key: 'cpu',
      name: 'CPU',
    },
    {
      key: 'ram',
      name: 'RAM',
    },
    {
      key: 'network',
      name: 'Network',
    },
    {
      key: 'diskio',
      name: 'Disk IOPS',
    },
    {
      key: 'diskrw',
      name: 'Disk Read / Write',
    },
  ];
  GSTIME = [
    {
      key: 5,
      name: '5 phút',
    },
    {
      key: 15,
      name: '15 phút',
    },
    {
      key: 60,
      name: '1 giờ',
    },
  ];

  getMonitorData() {
    this.chartData = [];
    this.cahrt = [];
    this.dataService
      .getMonitorByCloudId(
        this.cloudId,
        this.regionId,
        this.valueGSTIME,
        this.valueGSCPU
      )
      .subscribe((data: any) => {
        data[0].datas.forEach((e: any) => {
          const item = {
            time: this.formatTimestamp(e.timeSpan * 1000),
            y1: Number.parseFloat(e.value),
          };
          this.cahrt.push(item);
        });
        this.chartData = this.cahrt;
        this.cdr.detectChanges();
        console.log('dataMonitor', this.chartData);
      });
  }

  activeGSCard() {
    this.activeGS = true;
    this.getMonitorData();
  }

  onChangeCPU(event?: any) {
    this.valueGSCPU = event;
    this.getMonitorData();
  }
  onChangeTIME(event?: any) {
    this.valueGSTIME = event;
    if (this.valueGSCPU != '') {
      this.getMonitorData();
    }
  }
}
