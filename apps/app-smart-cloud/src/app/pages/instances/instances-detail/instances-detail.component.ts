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
  cahrt = [];
  valueGSCPU: string = 'ram';
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
      key: 43200,
      name: '1 ' + this.i18n.fanyi('app.month'),
    },
    {
      key: 129600,
      name: '3 ' + this.i18n.fanyi('app.months'),
    },
  ];

  summary: Summary = new Summary();
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
        this.summary = data[0];
        this.createChartStorageUse();
        this.cdr.detectChanges();
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
      // Lấy chỉ phần thời gian hh:mm
      const date = new Date(item.timeSpan * 1000);
      const timeKey = this.transform(item.timeSpan);

      // Gộp các giá trị trùng lặp
      if (!acc[timeKey]) {
        acc[timeKey] = 0;
      }
      acc[timeKey] += item.value;
      return acc;
    }, {} as { [key: string]: number });
  }

  private createDefaultChart(startDate, name: string): Chart {
    const defaultTimeRange = this.generateTimeRange(startDate);

    return new Chart({
      chart: {
        type: 'line',
      },
      title: {
        text: '',
      },
      xAxis: {
        categories: defaultTimeRange,
        title: {
          text: '',
        },
      },
      yAxis: {
        title: {
          text: '',
        },
        min: 0,
        // max: 10
      },
      series: [
        {
          name: name,
          data: new Array(defaultTimeRange.length).fill(0),
        } as any,
      ],
    });
  }

  private generateTimeRange(startDate): string[] {
    const startTimestamp = startDate; // Sử dụng startDate hoặc ngày hiện tại
    const end = new Date(); // Ngày hiện tại

    const timeLabels: string[] = [];
    const start = new Date(startTimestamp * 1000); // Chuyển đổi từ UNIX timestamp sang Date

    while (start <= end) {
      timeLabels.push(
        `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')}`
      );
      start.setMinutes(start.getMinutes() + 60); // Thêm 1 giờ
    }
    return timeLabels;
  }

  getFormattedStartDate(timestamp) {
    return new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
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
        returnLabel = `${hours}:00`;
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

  chartStorageUse: Chart;
  createChartStorageUse() {
    const data =
      this.summary?.datas?.map((item) => ({
        timeSpan: item.timeSpan,
        value: parseInt(item.value, 10), // Chuyển đổi value từ chuỗi sang số
      })) || [];
    console.log('rawData:', data);
    if (!data || data.length === 0) {
      console.warn('Data is null or empty, using default time range.');
      // Sử dụng ChangeDetectorRef để cập nhật lại biểu đồ
      this.chartStorageUse = this.createDefaultChart(
        this.summary?.startDate,
        this.i18n.fanyi('app.chart') + ' ' + this.typeGSTitle
      );
      this.cdr.detectChanges(); // Buộc Angular cập nhật lại
      return;
    }
    const uniqueData = this.removeDuplicates(data);
    // Chuyển đổi timestamp thành định dạng thời gian đọc được
    const labels = Object.keys(uniqueData);
    // Trích xuất giá trị dữ liệu
    const dataValues = Object.values(uniqueData).map((value) => value / 1024); // Chuyển từ KB sang MB
    console.log('dataValues', dataValues);
    // Cấu hình Highcharts
    this.chartStorageUse = new Chart({
      chart: {
        type: 'line',
      },
      title: {
        text: '',
      },
      xAxis: {
        categories: labels,
        title: {
          text: '',
        },
      },
      yAxis: {
        title: {
          text: '',
        },
      },
      series: [
        {
          name: this.typeGSTitle + ' (' + this.summary.unit + ')',
          data: dataValues, // Đảm bảo rằng data là một mảng số
        } as any,
      ], // Ép kiểu để khắc phục lỗi TypeScript
    });
    this.cdr.detectChanges();
  }
}
