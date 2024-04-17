import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { OrderService } from '../../../shared/services/order.service';
import { OrderDTOSonch } from '../../../shared/models/order.model';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotificationService } from '../../../../../../../libs/common-utils/src';
import {getCurrentRegionAndProject} from "@shared";

@Component({
  selector: 'one-portal-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.less'],
})
export class OrderDetailComponent {
  id: any;
  regionId: any;
  projectId: any;
  data: OrderDTOSonch;
  currentStep = 1;
  titleStepFour: string = 'Đã cài đặt';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private service: OrderService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    const url = this.id.split('-');
    if (url.length > 1) {
      this.service
        .getOrderBycode(this.id)
        .pipe(
          finalize(() => {
            if (this.data.statusCode == 4) {
              this.titleStepFour = 'Thành công';
            } else if (this.data.statusCode == 5) {
              if (this.data.invoiceCode != '') {
                this.titleStepFour = 'Sự cố';
              } else {
                this.titleStepFour = '';
              }
            } else {
              this.titleStepFour = 'Đã cài đặt';
            }
          })
        )
        .subscribe({
          next: (data) => {
            this.data = data;
          },
          error: (e) => {
            this.notification.error('Thất bại', 'Lấy dữ liệu thất bại');
          },
        });
    } else {
      const idParse = parseInt(this.id);
      this.service
        .getDetail(idParse)
        .pipe(
          finalize(() => {
            if (this.data.statusCode == 4) {
              this.titleStepFour = 'Thành công';
            } else if (this.data.statusCode == 5) {
              if (this.data.invoiceCode != '') {
                this.titleStepFour = 'Sự cố';
              } else {
                this.titleStepFour = '';
              }
            } else {
              this.titleStepFour = 'Đã cài đặt';
            }
          })
        )
        .subscribe({
          next: (data) => {
            this.data = data;
            console.log(data);
            
          },
          error: (e) => {
            this.notification.error('Thất bại', 'Lấy dữ liệu thất bại');
          },
        });
    }

    if (this.notificationService.connection == undefined) {
      this.notificationService.initiateSignalrConnection();
    }

    this.notificationService.connection.on('UpdateOrder', (data) => {
      if (data.statusCode) {
        this.data.statusCode = data.statusCode;
        this.cdr.detectChanges();
      }
    });
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    this.router.navigate(['/app-smart-cloud/order/list'])
  }
}
