import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import {
  HealthCreate,
  HealthUpdate,
  m_LBSDNHealthMonitor,
  MemberOfPool,
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
  lbId: number;
  regionId: number;
  projectId: number;
  pageSizeHealth: number = 10;
  currentPageHealth: number = 1;
  totalHealth: number;
  poolDetail: PoolDetail = new PoolDetail();

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
    private service: LoadBalancerService,
    private cdr: ChangeDetectorRef,
    public notification: NzNotificationService,
    private loadingSrv: LoadingService
  ) {}

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.service
      .getPoolDetail(this.id, this.lbId)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe({
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
        this.poolDetail.poolId,
        this.pageSizeHealth,
        this.currentPageHealth
      )
      .pipe(finalize(() => (this.loadingHealth = false)))
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

  listMethod: any[] = [
    { displayName: 'GET' },
    { displayName: 'POST' },
    { displayName: 'PUT' },
    { displayName: 'DELETE' },
  ];

  isVisibleHealth: boolean = false;
  isCreate: boolean;
  healthUpdate: HealthUpdate = new HealthUpdate();
  healthForm: any;
  form: FormGroup;
  modalCeateHealth(checkCreate: boolean, data: m_LBSDNHealthMonitor) {
    if (checkCreate) {
      this.healthForm = new HealthCreate();
      this.healthForm.type = 'HTTP';
      this.isCreate = true;
    } else {
      this.healthForm = data;
    }
    this.isVisibleHealth = true;
    this.form = new FormGroup({
      name: new FormControl('', {
        validators: [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_]*$/),
        ],
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

  handleOkCreateHealth() {
    this.isVisibleHealth = false;
    this.notification.success('', 'Tạo mới Health Monitor thành công');
  }

  handleCancelCreateHealth() {
    this.isVisibleHealth = false;
  }

  loadingMember: boolean = true;
  listMember: MemberOfPool[] = [];
  getListMember() {
    this.loadingMember = true;
    this.service
      .getListMember(this.poolDetail.poolId, this.regionId, this.projectId)
      .pipe(finalize(() => (this.loadingMember = false)))
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

  modalCreateMember() {}
}
