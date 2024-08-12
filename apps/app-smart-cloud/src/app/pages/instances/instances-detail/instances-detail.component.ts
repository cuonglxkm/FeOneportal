import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  SimpleChanges,
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
import { Chart } from 'angular-highcharts';
import { Summary } from 'src/app/shared/models/object-storage.model';

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
  newDate: Date = new Date();
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

  onReloadInstanceDetail(data: any) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  onRegionChange(region: RegionModel) {
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  onRegionChanged(region: RegionModel) {}

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
  valueGSCPU: string = 'ram';
  valueGSTIME: number = 5;
  cloudId: string;
  regionId: number;
  projectId: number;

  GSCPU = [
    {
      key: 'ram',
      name: 'RAM',
    },
    {
      key: 'cpu',
      name: 'CPU',
    },
    {
      key: 'diskio',
      name: 'DiskIO',
    },
    {
      key: 'network',
      name: 'Network IO',
    },
    {
      key: 'diskrw',
      name: 'Disk Read / Write',
    },
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
      key: 43200,
      name: '1 ' + this.i18n.fanyi('app.month'),
    },
    {
      key: 129600,
      name: '3 ' + this.i18n.fanyi('app.months'),
    },
  ];

  dataChart: any;

  getMonitorData() {
    this.dataService
      .getMonitorByCloudId(
        this.cloudId,
        this.regionId,
        this.valueGSTIME,
        this.valueGSCPU
      )
      .subscribe({
        next: (data: any) => {
          this.dataChart = data;
          this.createChart();
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(e.error.message, '');
        },
      });
  }

  activeGSCard() {
    this.activeGS = true;
    this.getMonitorData();
  }

  typeGSTitle: string = 'RAM';

  onChangeCPU(event?: any) {
    this.valueGSCPU = event;
    this.typeGSTitle = this.GSCPU.filter(
      (e) => e.key == this.valueGSCPU
    )[0].name;
    this.newDate = new Date();
    this.getMonitorData();
  }

  onChangeTIME(event?: any) {
    this.valueGSTIME = event;
    if (this.valueGSCPU != '') {
      this.newDate = new Date();
      this.getMonitorData();
    }
  }

  private removeDuplicates(data: { timeSpan: number; value: number }[]): {
    [key: string]: number;
  } {
    return data.reduce((acc, item) => {
      const timeKey = this.transform(item.timeSpan);
      // Nếu khóa chưa có trong acc hoặc giá trị mới lớn hơn giá trị hiện tại
      if (!(timeKey in acc) || item.value > acc[timeKey]) {
        acc[timeKey] = Number(item.value);
      }
      return acc;
    }, {} as { [key: string]: number });
  }

  getFormattedStartDate(timestamp) {
    return new Date(timestamp * 1000);
  }

  transform(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    let returnLabel = '';
    switch (this.valueGSTIME) {
      case 5:
        returnLabel = `${hours}:${minutes}`;
        break;
      case 15:
        returnLabel = `${hours}:${minutes}`;
        break;
      case 60:
        returnLabel = `${hours}:${minutes}`;
        break;
      case 1440:
        returnLabel = `${day}/${month}/${year} ${hours}:00`;
        break;
      case 10080:
        returnLabel = `${day}/${month}/${year}`;
        break;
      case 43200:
        returnLabel = `${day}/${month}/${year}`;
        break;
      case 129600:
        returnLabel = `${day}/${month}/${year}`;
        break;
      default:
        returnLabel = `${hours}:${minutes}:${seconds}`;
    }

    return returnLabel;
  }

  chart: Chart;
  unitChart: string;
  maxValue: number;
  createChart() {
    this.maxValue = 0;
    if (!this.dataChart || this.dataChart.length === 0) {
      console.warn('No data available for chart');
      return;
    }

    this.dataChart.forEach((item) => {
      item.datas.forEach((data) => {
        const value = parseFloat(data.value);
        if (value > this.maxValue) {
          this.maxValue = value;
        }
      });
    });
    console.log('max value', this.maxValue);

    const seriesData = this.dataChart.map((item) => {
      let data;
      let unit = item.unit;
      if (item.title.includes('CPU')) {
        data = item.datas.map((d) => ({
          timeSpan: d.timeSpan,
          value: Number(parseFloat(d.value).toFixed(2)),
        }));
      } 
      if(this.valueGSCPU === 'diskio'){
        data = item.datas.map((d) => ({
          timeSpan: d.timeSpan,
          value: Number((parseFloat(d.value)).toFixed(2)),
        }));
        unit = 'io/s'
      }
      else {
        if (this.maxValue >= 1099511627776) {
          // Convert to TiB
          data = item.datas.map((d) => ({
            timeSpan: d.timeSpan,
            value: Number((parseFloat(d.value) / 1099511627776).toFixed(2)),
          }));
          unit = this.valueGSCPU !== 'network' ? 'TiB' : 'TiB/s';
        } else if (this.maxValue >= 1073741824) {
          // Convert to GiB
          data = item.datas.map((d) => ({
            timeSpan: d.timeSpan,
            value: Number((parseFloat(d.value) / 1073741824).toFixed(2)),
          }));
          unit = this.valueGSCPU !== 'network' ?'GiB':'GiB/s';
        } else if (this.maxValue >= 1048576) {
          // Convert to MiB
          data = item.datas.map((d) => ({
            timeSpan: d.timeSpan,
            value: Number((parseFloat(d.value) / 1048576).toFixed(2)),
          }));
          unit = this.valueGSCPU !== 'network' ?'MiB':'MiB/s';
        } else if (this.maxValue >= 1024) {
          // Convert to KiB
          data = item.datas.map((d) => ({
            timeSpan: d.timeSpan,
            value: Number((parseFloat(d.value) / 1024).toFixed(2)),
          }));
          unit = this.valueGSCPU !== 'network' ?'KiB':'KiB/s';
        } else {
          // Keep as bytes
          data = item.datas.map((d) => ({
            timeSpan: d.timeSpan,
            value: Number(parseFloat(d.value).toFixed(2)),
          }));
          unit = this.valueGSCPU !== 'network' ?'byte':'byte/s';
        }
      }

      const uniqueData = this.removeDuplicates(data);
      const labels = Object.keys(uniqueData);
      const dataValues = Object.values(uniqueData);

      return {
        name: item.title + ' (' + unit + ')',
        data: dataValues,
        labels: labels,
      };
    });

    const allLabels: string[] = Array.from(
      new Set(seriesData.flatMap((series) => series.labels))
    );

    this.chart = new Chart({
      chart: {
        type: 'line',
      },
      title: {
        text: '',
      },
      xAxis: {
        categories: allLabels,
        title: {
          text: '',
        },
        labels: {
          formatter: function(){
            const toStringValue = this.value.toString()
            if(toStringValue.includes(" ")){
              return toStringValue.split(" ")?.[1]
            }
            return `${this.value.toString()}`
          }
        }
      },
      yAxis: {
        title: {
          text: '',
        },
      },
      series: seriesData.map((series) => ({
        name: series.name,
        data: series.data,
      })) as any,
    });

    this.cdr.detectChanges();
  }
}
