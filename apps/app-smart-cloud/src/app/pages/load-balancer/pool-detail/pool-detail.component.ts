import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import {
  HealthCreate,
  HealthUpdate,
  LoadBalancerModel,
  m_LBSDNHealthMonitor,
  MemberCreateOfPool,
  MemberOfPool,
  MemberUpdateOfPool,
  PoolDetail,
} from 'src/app/shared/models/load-balancer.model';
import { LoadBalancerService } from 'src/app/shared/services/load-balancer.service';

@Component({
  selector: 'one-portal-pool-detail',
  templateUrl: './pool-detail.component.html',
  styleUrls: ['./pool-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolDetailComponent implements OnInit {
  id: string;
  regionId: number;
  projectId: number;
  pageSizeHealth: number = 10;
  currentPageHealth: number = 1;
  totalHealth: number;
  poolDetail: PoolDetail = new PoolDetail();

  @ViewChild('nameInput') healthInput: ElementRef;
  @ViewChild('memberInput') memberInput: ElementRef;

  onKeyDown(event: KeyboardEvent) {
    // Lấy giá trị của phím được nhấn
    const key = event.key;
    // Kiểm tra xem phím nhấn có phải là một số hoặc phím di chuyển không
    if (
      (isNaN(Number(key)) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight') ||
      key === '.'
    ) {
      // Nếu không phải số hoặc đã nhập dấu chấm và đã có dấu chấm trong giá trị hiện tại
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private service: LoadBalancerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public notification: NzNotificationService,
    private loadingSrv: LoadingService
  ) {}

  idLB: number;
  loadBalancer: LoadBalancerModel = new LoadBalancerModel();
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.idLB = params['idLB'];
    });
    this.service.getLoadBalancerById(this.idLB, true).subscribe((data) => {
      this.loadBalancer = data;
    });
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    console.log('id pool', this.id);
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.service.getPoolDetail(this.id, this.idLB).subscribe({
      next: (data: any) => {
        this.poolDetail = data;
        this.getListHealth();
        this.getListMember();
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          this.i18n.fanyi('app.notification.detail.pool.fail')
        );
      },
    });
  }

  loadingHealth: boolean = true;
  listHealth: m_LBSDNHealthMonitor[] = [];
  getListHealth() {
    this.loadingHealth = true;
    this.service
      .getListHealth(
        this.regionId,
        this.projectId,
        this.id,
        this.pageSizeHealth,
        this.currentPageHealth
      )
      .pipe(
        finalize(() => {
          this.loadingHealth = false;
        })
      )
      .subscribe({
        next: (data: any) => {
          this.listHealth = data.records;
          this.totalHealth = data.totalCount;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.notification.get.list.health.fail')
          );
        },
      });
  }

  listCheckedMethod: any[] = [
    { displayName: 'HTTP' },
    { displayName: 'PING' },
    { displayName: 'TCP' },
  ];

  listMethod: any[] = [
    { displayName: 'GET' },
    { displayName: 'POST' },
    { displayName: 'PUT' },
    { displayName: 'DELETE' },
  ];

  isHttpType: boolean;
  isNotHttp(event: string) {
    this.healthForm.httpMethod = null;
    this.healthForm.expectedCodes = null;
    this.healthForm.urlPath = null;
    if (event != 'HTTP') {
      this.isHttpType = false;
    } else {
      this.isHttpType = true;
    }
  }

  isVisibleHealth: boolean = false;
  titleModalHealth: string;
  isCreate: boolean;
  healthForm: any;
  form: FormGroup;
  modalHealth(checkCreate: boolean, data: m_LBSDNHealthMonitor) {
    if (checkCreate) {
      this.healthForm = new HealthCreate();
      this.healthForm.type = 'HTTP';
      this.isCreate = true;
      this.titleModalHealth = this.i18n.fanyi('app.health.monitor.create');
      setTimeout(() => {
        this.healthInput.nativeElement.focus();
      }, 300);
    } else {
      this.healthForm = data;
      this.isCreate = false;
      this.titleModalHealth = this.i18n.fanyi('app.health.monitor.edit');
    }
    this.isVisibleHealth = true;
    this.form = new FormGroup({
      name: new FormControl('', {
        validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9]*$/)],
      }),
      checkMethod: new FormControl('', {
        validators: [Validators.required],
      }),
      maxRetriesDown: new FormControl('', {
        validators: [Validators.required],
      }),
      delay: new FormControl('', {
        validators: [Validators.required],
      }),
      maxRetries: new FormControl('', {
        validators: [Validators.required],
      }),
      timeout: new FormControl('', {
        validators: [Validators.required],
      }),
      httpMethod: new FormControl('', {
        validators: [Validators.required],
      }),
      expectedCode: new FormControl('', {
        validators: [Validators.required],
      }),
    });
  }

  handleOkHealth() {
    this.isVisibleHealth = false;
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    if (this.isCreate) {
      this.healthForm.poolId = this.id;
      this.healthForm.customerId = this.tokenService.get()?.userId;
      this.healthForm.projectId = this.projectId;
      this.healthForm.regionId = this.regionId;
      this.service
        .createHealth(this.healthForm)
        .pipe(
          finalize(() => {
            this.loadingSrv.close();
          })
        )
        .subscribe({
          next: (data) => {
            this.notification.success(
              '',
              this.i18n.fanyi('app.notification.create.health.success')
            );
            this.getListHealth();
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.notification.create.health.fail')
            );
          },
        });
    } else {
      let healthUpdate: HealthUpdate = new HealthUpdate();
      healthUpdate.id = this.healthForm.id;
      healthUpdate.name = this.healthForm.name;
      healthUpdate.delay = this.healthForm.delay;
      healthUpdate.maxRetries = this.healthForm.maxRetries;
      healthUpdate.timeout = this.healthForm.timeout;
      healthUpdate.adminStateUp = true;
      healthUpdate.expectedCodes = this.healthForm.expectedCodes;
      healthUpdate.httpMethod = this.healthForm.httpMethod;
      healthUpdate.urlPath = this.healthForm.urlPath;
      healthUpdate.maxRetriesDown = this.healthForm.maxRetriesDown;
      healthUpdate.customerId = this.tokenService.get()?.userId;
      healthUpdate.projectId = this.projectId;
      healthUpdate.regionId = this.regionId;
      this.service
        .updateHealth(healthUpdate)
        .pipe(
          finalize(() => {
            this.loadingSrv.close();
          })
        )
        .subscribe({
          next: (data) => {
            this.notification.success(
              '',
              this.i18n.fanyi('app.notification.edit.health.success')
            );
            this.getListHealth();
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.notification.edit.health.fail')
            );
          },
        });
    }
  }

  handleCancelHealth() {
    this.isVisibleHealth = false;
  }

  isVisibleDelete: boolean = false;
  titleDelete: string = '';
  typeDelete: string;
  dataDelete: any;
  inputConfirm: string = '';
  checkInputConfirm: boolean = false;
  checkInputEmpty: boolean = false;
  showModalDelete(isDeletedHealth: boolean, data: any) {
    this.isVisibleDelete = true;
    this.inputConfirm = '';
    if (isDeletedHealth) {
      this.titleDelete = this.i18n.fanyi('app.title.delete.health', {
        name: data.name,
      });
      this.typeDelete = 'Health Monitor';
      this.dataDelete = data;
    } else {
      this.titleDelete = this.i18n.fanyi('app.title.delete.member', {
        name: data.name,
      });
      this.typeDelete = 'Member';
      this.dataDelete = data;
    }
  }

  handleOkDelete() {
    if (this.inputConfirm == this.dataDelete.name) {
      this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
      this.checkInputConfirm = false;
      this.checkInputEmpty = false;
      this.isVisibleDelete = false;
      if (this.typeDelete == 'Health Monitor') {
        this.service
          .deleteHealth(this.dataDelete.id, this.regionId, this.projectId)
          .pipe(
            finalize(() => {
              this.loadingSrv.close();
            })
          )
          .subscribe({
            next: (data: any) => {
              this.notification.success(
                '',
                this.i18n.fanyi('app.notification.delete.health.success')
              );
              this.listHealth = [];
              this.cdr.detectChanges();
            },
            error: (e) => {
              this.isVisibleDelete = false;
              this.notification.error(
                e.statusText,
                this.i18n.fanyi('app.notification.delete.health.fail')
              );
            },
          });
      } else {
        this.service
          .deleteMember(
            this.dataDelete.id,
            this.id,
            this.regionId,
            this.projectId
          )
          .pipe(
            finalize(() => {
              this.loadingSrv.close();
            })
          )
          .subscribe({
            next: (data: any) => {
              this.getListMember();
              this.notification.success(
                '',
                this.i18n.fanyi('app.notification.delete.member.success')
              );
            },
            error: (e) => {
              this.isVisibleDelete = false;
              this.notification.error(
                e.statusText,
                this.i18n.fanyi('app.notification.delete.member.fail')
              );
            },
          });
      }
    } else if (this.inputConfirm == '') {
      this.checkInputEmpty = true;
      this.checkInputConfirm = false;
    } else {
      this.checkInputEmpty = false;
      this.checkInputConfirm = true;
    }
    this.cdr.detectChanges();
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
    this.checkInputConfirm = false;
    this.checkInputEmpty = false;
  }

  loadingMember: boolean = true;
  listMember: MemberOfPool[] = [];
  getListMember() {
    this.loadingMember = true;
    this.service
      .getListMember(this.id, this.regionId, this.projectId)
      .pipe(
        finalize(() => {
          this.loadingMember = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data: any) => {
          this.listMember = data;
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.notification.get.list.member.fail')
          );
        },
      });
  }

  isVisibleMember: boolean = false;
  titleModalMember: string;
  memberForm: any;
  formMember: FormGroup;
  ipAddress: string;
  protocol_port: number;
  modalMember(checkCreate: boolean, data: MemberOfPool) {
    if (checkCreate) {
      this.memberForm = new MemberCreateOfPool();
      this.memberForm.address = this.ipAddress;
      this.memberForm.protocol_port = this.protocol_port;
      this.memberForm.poolId = this.id;
      this.memberForm.subnetId = this.loadBalancer.subnetId;
      this.memberForm.customerId = this.tokenService.get()?.userId;
      this.memberForm.regionId = this.regionId;
      this.memberForm.vpcId = this.projectId;
      this.isCreate = true;
      this.titleModalMember = this.i18n.fanyi('app.member.create');
      setTimeout(() => {
        this.memberInput.nativeElement.focus();
      }, 300);
    } else {
      this.formMember = new FormGroup({
        name: new FormControl('', {
          validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9]*$/)],
        }),
        ipPrivate: new FormControl('', {
          validators: [Validators.required],
        }),
        port: new FormControl('', {
          validators: [Validators.required],
        }),
        weight: new FormControl('', {
          validators: [Validators.required],
        }),
      });
      this.memberForm = data;
      this.isCreate = false;
      this.titleModalMember = this.i18n.fanyi('app.member.edit');
    }
    this.isVisibleMember = true;
  }

  handleOkMember() {
    this.isVisibleMember = false;
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    if (this.isCreate) {
      this.service
        .createMember(this.memberForm)
        .pipe(
          finalize(() => {
            this.loadingSrv.close();
          })
        )
        .subscribe({
          next: (data) => {
            this.notification.success(
              '',
              this.i18n.fanyi('app.notification.create.member.success')
            );
            this.getListMember();
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.notification.create.member.fail')
            );
          },
        });
    } else {
      let memberUpdate: MemberUpdateOfPool = new MemberUpdateOfPool();
      memberUpdate.memberId = this.memberForm.id;
      memberUpdate.customerId = this.tokenService.get()?.userId;
      memberUpdate.regionId = this.regionId;
      memberUpdate.vpcId = this.projectId;
      memberUpdate.name = this.memberForm.name;
      memberUpdate.address = this.memberForm.ipAddress;
      memberUpdate.protocol_port = this.memberForm.port;
      memberUpdate.weight = this.memberForm.weight;
      memberUpdate.poolId = this.id;
      memberUpdate.backup = this.memberForm.backup;
      this.service
        .updateMember(memberUpdate)
        .pipe(
          finalize(() => {
            this.loadingSrv.close();
          })
        )
        .subscribe({
          next: (data) => {
            this.notification.success(
              '',
              this.i18n.fanyi('app.notification.edit.member.success')
            );
            this.getListMember();
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.notification.edit.member.fail')
            );
          },
        });
    }
  }

  handleCancelMember() {
    this.isVisibleMember = false;
  }
}
