import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { PoolDetail } from 'src/app/shared/models/load-balancer.model';
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
  poolDetail: PoolDetail = new PoolDetail();

  constructor(
    private service: LoadBalancerService,
    private cdr: ChangeDetectorRef,
    public notification: NzNotificationService,
    private loadingSrv: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.service.getPoolDetail(this.id, this.lbId).pipe(
      finalize(() => {
        this.loadingSrv.close();
      })
    )
    .subscribe({
      next: (data: any) => {
        this.poolDetail = data
      },
      error: (e) => {
        this.notification.error(e.statusText, 'Lấy chi tiết Pool không thành công');
      },
    });
  }

  
}
