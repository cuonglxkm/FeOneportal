import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { InstancesModel, SecurityGroupModel } from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { G2TimelineData, G2TimelineMap } from '@delon/chart/timeline';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';

class BlockStorage {
  id: number = 0;
  type?: string = '';
  name?: string = '';
  vCPU?: string = '';
  ram?: string = '';
  capacity?: string = '';
  status?: string = '';
  typeVolume?: string = '';
  price?: string = '000';
}
class Network {
  name?: string = 'prive_network';
  mac?: string = '';
  ip?: string = '';
  status?: string = '';
}

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
  listOfDataBlockStorage: BlockStorage[] = [];
  listOfDataNetwork: Network[] = [];
  listSecurityGroupModel: SecurityGroupModel[] = [];
  defaultNetwork: Network = new Network();

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private route: Router,
    public message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.listOfDataNetwork.push(this.defaultNetwork);

    this.router.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService.getById(this.id, false).subscribe((data: any) => {
          this.instancesModel = data;
          this.loading = false;

          this.dataService
            .getAllSecurityGroupByInstance(
              this.instancesModel.cloudId,
              this.instancesModel.regionId,
              this.instancesModel.customerId,
              this.instancesModel.projectId
            )
            .subscribe((datasg: any) => {
              this.listSecurityGroupModel = datasg;
              this.cdr.detectChanges();
            });
        });
      }
    });
  }
  navigateToEdit() {
    this.route.navigate(['/app-smart-cloud/vm/instances-edit/' + this.id]);
  }
  navigateToChangeImage() {
    this.route.navigate(['/app-smart-cloud/vm/instances-edit-info/' + this.id]);
  }
  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/vm']);
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
  delete(tpl: TemplateRef<{}>): void {
    //xóa
    this.modalSrv.create({
      nzTitle: 'Xóa máy ảo',
      nzContent: tpl,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.dataService.delete(this.id).subscribe(
          (data: any) => {
            console.log(data);
            if (data == true) {
              this.message.success('Xóa máy ảo thành công');
            } else {
              this.message.error('Xóa máy ảo không thành công');
            }
          },
          () => {
            this.message.error('Xóa máy ảo không thành công');
          }
        );
      },
    });
  }
  continue(tpl: TemplateRef<{}>): void {
    //gia hạn
    this.modalSrv.create({
      nzTitle: 'Gia hạn',
      nzContent: tpl,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.message.success('Gia hạn thành công');
        //  this.dataService.delete(this.id).subscribe(
        //   (data: any) => {
        //     console.log(data);
        //     if (data == true) {
        //       this.message.success('Xóa máy ảo thành công');
        //     } else {
        //       this.message.error('Xóa máy ảo không thành công');
        //     }
        //   },
        //   () => {
        //     this.message.error('Xóa máy ảo không thành công');
        //   }
        // );
      },
    });
  }

  resetPassword: string = '';
  resetPasswordRepeat: string = '';

  resetPasswordFc(tpl: TemplateRef<{}>): void {
    //Reset mật khẩu máy ảo
    this.modalSrv.create({
      nzTitle: 'Reset mật khẩu máy ảo',
      nzContent: tpl,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        if (this.resetPassword == this.resetPasswordRepeat) {
          this.message.success('Reset mật khẩu máy ảo thành công');
          // this.dataService
          //   .resetpassword({ id: this.id, newPassword: this.resetPassword })
          //   .subscribe(
          //     (data: any) => {
          //       console.log(data);
          //       if (data == true) {
          //         this.message.success('Reset mật khẩu máy ảo thành công');
          //       } else {
          //         this.message.error('Reset mật khẩu không thành công');
          //       }
          //     },
          //     () => {
          //       this.message.error('Reset mật khẩu không thành công');
          //     }
          //   );
        } else {
          this.message.error('Mật khẩu không khớp!');
        }
      },
    });
  }
  //Giám sát
  activeGS: boolean = false;
  offlineChartData!: any[];
  valueGSCPU:string =''
  valueGSTIME:string =''

  GSCPU = [
    {
      key: '1',
      name: 'CPU',
    },
    {
      key: '2',
      name: 'RAM',
    },
    {
      key: '3',
      name: 'Network',
    },
    {
      key: '4',
      name: 'Disk IOPS',
    },
    {
      key: '5',
      name: 'Disk Read / Write',
    },
  ];
  GSTIME = [
    {
      key: '1',
      name: '5 phút',
    },
    {
      key: '2',
      name: '15 phút',
    },
  ];

  cahrt = [
    {
      time: '2023-11-13T02:55:02.606Z',
      y1: 75,
      y2: 42,
      _time: 1699844102606,
    },
    {
      time: '2023-11-13T03:25:02.606Z',
      y1: 55,
      y2: 33,
      _time: 1699845902606,
    },
    {
      time: '2023-11-13T03:55:02.606Z',
      y1: 39,
      y2: 97,
      _time: 1699847702606,
    },
    {
      time: '2023-11-13T04:25:02.606Z',
      y1: 24,
      y2: 40,
      _time: 1699849502606,
    },
    {
      time: '2023-11-13T04:55:02.606Z',
      y1: 93,
      y2: 14,
      _time: 1699851302606,
    },
    {
      time: '2023-11-13T05:25:02.606Z',
      y1: 46,
      y2: 14,
      _time: 1699853102606,
    },
    {
      time: '2023-11-13T05:55:02.606Z',
      y1: 57,
      y2: 55,
      _time: 1699854902606,
    },
    {
      time: '2023-11-13T06:25:02.606Z',
      y1: 75,
      y2: 52,
      _time: 1699856702606,
    },
    {
      time: '2023-11-13T06:55:02.606Z',
      y1: 99,
      y2: 13,
      _time: 1699858502606,
    },
    {
      time: '2023-11-13T07:25:02.606Z',
      y1: 60,
      y2: 18,
      _time: 1699860302606,
    },
    {
      time: '2023-11-13T07:55:02.606Z',
      y1: 44,
      y2: 41,
      _time: 1699862102606,
    },
    {
      time: '2023-11-13T08:25:02.606Z',
      y1: 14,
      y2: 46,
      _time: 1699863902606,
    },
    {
      time: '2023-11-13T08:55:02.606Z',
      y1: 108,
      y2: 95,
      _time: 1699865702606,
    },
    {
      time: '2023-11-13T09:25:02.606Z',
      y1: 71,
      y2: 21,
      _time: 1699867502606,
    },
    {
      time: '2023-11-13T09:55:02.606Z',
      y1: 36,
      y2: 44,
      _time: 1699869302606,
    },
    {
      time: '2023-11-13T10:25:02.606Z',
      y1: 64,
      y2: 94,
      _time: 1699871102606,
    },
    {
      time: '2023-11-13T10:55:02.606Z',
      y1: 49,
      y2: 61,
      _time: 1699872902606,
    },
    {
      time: '2023-11-13T11:25:02.606Z',
      y1: 67,
      y2: 34,
      _time: 1699874702606,
    },
    {
      time: '2023-11-13T11:55:02.606Z',
      y1: 101,
      y2: 29,
      _time: 1699876502606,
    },
    {
      time: '2023-11-13T12:25:02.606Z',
      y1: 26,
      y2: 101,
      _time: 1699878302606,
    },
  ];
  activeGSCard() {
    this.activeGS = true;
    this.offlineChartData = this.cahrt;
  }
  // refresh(max?: number): void {
  //   this.maxAxis = max ?? this.maxAxis;
  //   const { titleMap, data } = this.genData(this.maxAxis);
  //   this.chartData = data;
  //   this.titleMap = titleMap;
  // }
  onChangeCPU(event?:any){
    this.offlineChartData = this.cahrt;
  }
  onChangeTIME(event?:any){
    this.offlineChartData = this.cahrt;
  }
}
