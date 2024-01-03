import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
} from '@angular/core';
import {
  InstancesModel,
  Network,
  SecurityGroupModel,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { finalize } from 'rxjs';
import { LoadingService } from '@delon/abc/loading';
import { G2TimelineData } from '@delon/chart/timeline';

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
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private route: Router,
    public message: NzMessageService,
    private loadingSrv: LoadingService
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
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.router.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));

        this.dataService.getById(this.id, false).subscribe((data: any) => {
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
            .pipe(finalize(() => this.loadingSrv.close()))
            .subscribe((datasg: any) => {
              this.listSecurityGroupModel = datasg;
              this.cdr.detectChanges();
            });
          this.cdr.detectChanges();
        });
      }
    });
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

  add(tpl: TemplateRef<{}>): void {
    this.modalSrv.create({
      nzTitle: '',
      nzContent: tpl,
      nzOnOk: () => {
        // this.http.post('/rule', { description: this.description }).subscribe(() => this.getData());
      },
    });
  }

  //Giám sát
  activeGS: boolean = false;
  maxAxis = 1;
  cahrt = [];
  valueGSCPU: string = 'cpu';
  valueGSTIME: number = 5;
  cloudId: string;
  regionId: number;
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
      .pipe(finalize(() => this.loadingSrv.close()))
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
    this.valueGSTIME = null;
  }
  onChangeTIME(event?: any) {
    this.valueGSTIME = event;
    if (this.valueGSCPU != '') {
      this.getMonitorData();
    }
  }
}
