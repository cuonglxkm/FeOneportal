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
import { LoadingService } from '@delon/abc/loading';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
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
    private service: LoadBalancerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public notification: NzNotificationService,
    private loadingSrv: LoadingService
  ) {}

  idLB: number;
  loadBalancer: LoadBalancerModel = new LoadBalancerModel()
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.idLB = params['idLB'];
    });
    this.service.getLoadBalancerById(this.idLB, true).subscribe(data => {
      this.loadBalancer = data
    })
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    console.log("id pool", this.id)
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
          'Lấy chi tiết Pool không thành công'
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
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            'Lấy danh sách Health Monitors không thành công'
          );
        },
      });
  }

  listCheckedMethod: any[] = [
    { displayName: 'HTTP' },
    { displayName: 'HTTPS' },
    { displayName: 'TCP' },
  ];

  listMethod: any[] = [
    { displayName: 'GET' },
    { displayName: 'POST' },
    { displayName: 'PUT' },
    { displayName: 'DELETE' },
  ];

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
      this.titleModalHealth = 'Tạo mới Health Monitor';
      setTimeout(() => {
        this.healthInput.nativeElement.focus();
      }, 300);
    } else {
      this.healthForm = data;
      this.isCreate = false;
      this.titleModalHealth = 'Chỉnh sửa Health Monitor';
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
            this.notification.success('', 'Tạo mới Health Monitor thành công');
            this.getListHealth();
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              'Tạo mới Health Monitor không thành công'
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
            this.notification.success('', 'Cập nhật Health Monitor thành công');
            this.getListHealth();
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              'Cập nhật Health Monitor không thành công'
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
      this.titleDelete = 'Xác nhận xóa Health Monitor' + data.name;
      this.typeDelete = 'Health Monitor';
      this.dataDelete = data;
    } else {
      this.titleDelete = 'Xác nhận xóa Member' + data.name;
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
              this.getListHealth();
              this.notification.success('', 'Xóa Health Monitor thành công');
            },
            error: (e) => {
              this.isVisibleDelete = false;
              this.notification.error(
                e.statusText,
                'Xóa Health Monitor không thành công'
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
              this.notification.success('', 'Xóa Member thành công');
            },
            error: (e) => {
              this.isVisibleDelete = false;
              this.notification.error(
                e.statusText,
                'Xóa Member không thành công'
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
            'Lấy danh sách Member không thành công'
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
      this.titleModalMember = 'Tạo mới Member';
      setTimeout(() => {
        this.memberInput.nativeElement.focus();
      }, 300);
    } else {
      this.memberForm = data;
      this.isCreate = false;
      this.titleModalMember = 'Chỉnh sửa Member';
    }
    this.isVisibleMember = true;
    this.formMember = new FormGroup({
      name: new FormControl('', {
        validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9]*$/)],
      }),
      weight: new FormControl('', {
        validators: [Validators.required],
      }),
    });
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
            this.notification.success('', 'Tạo mới Member thành công');
            this.getListMember();
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              'Tạo mới Member không thành công'
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
            this.notification.success('', 'Cập nhật Member thành công');
            this.getListMember();
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              'Cập nhật Member không thành công'
            );
          },
        });
    }
  }

  handleCancelMember() {
    this.isVisibleMember = false;
  }
}
