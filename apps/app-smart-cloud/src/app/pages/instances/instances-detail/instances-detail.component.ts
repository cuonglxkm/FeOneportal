import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  InstancesModel,
  Network,
  SecurityGroupModel,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { InstancesService } from '../instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { G2TimelineData } from '@delon/chart/timeline';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ProjectModel,
  RegionModel,
} from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

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
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private dataService: InstancesService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private notification: NzNotificationService
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

  checkPermission: boolean = false;
  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.activatedRoute.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService.getById(this.id, true).subscribe({
          next: (data: any) => {
            this.checkPermission = true;
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
          },
          error: (e) => {
            this.checkPermission = false;
            if (e.error.status == 404) {
              this.notification.error(e.error.status, '');
            } else {
              this.notification.error(e.error.message, '');
            }
            this.returnPage();
          },
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

  onReloadInstanceDetail(data: any) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  onRegionChange(region: RegionModel) {
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  onRegionChanged(region: RegionModel) {
    
  }

  userChangeProject() {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  project: ProjectModel;
  onProjectChange(project: ProjectModel) {
    this.project = project;
  }

  navigateToEdit() {
    if (this.project.type == 1) {
      this.router.navigate([
        '/app-smart-cloud/instances/instances-edit-vpc/' + this.id,
      ]);
    } else {
      this.router.navigate([
        '/app-smart-cloud/instances/instances-edit/' + this.id,
      ]);
    }
  }

  navigateToChangeImage() {
    this.router.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.id,
    ]);
  }

  returnPage(): void {
    this.router.navigate(['/app-smart-cloud/instances']);
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
      key: 'ram',
      name: 'RAM',
    },
    {
      key: 'cpu',
      name: 'vCPU',
    },
    {
      key: 'diskio',
      name: 'DiskIO',
    },
    {
      key: 'network',
      name: 'Network IO',
    },

    // {
    //   key: 'diskrw',
    //   name: 'Disk Read / Write',
    // },
  ];
  GSTIME = [
    {
      key: 5,
      name: '5 ' + this.i18n.fanyi('app.minute'),
    },
    {
      key: 15,
      name: '15 ' + this.i18n.fanyi('app.minute'),
    },
    {
      key: 60,
      name: '1 ' + this.i18n.fanyi('app.hour'),
    },
    {
      key: 1440,
      name: '1 ' + this.i18n.fanyi('app.day'),
    },
    {
      key: 10080,
      name: '1 ' + this.i18n.fanyi('app.week'),
    },
    {
      key: 302400,
      name: '1 ' + this.i18n.fanyi('app.month'),
    },
    {
      key: 907200,
      name: '3 ' + this.i18n.fanyi('app.months'),
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
