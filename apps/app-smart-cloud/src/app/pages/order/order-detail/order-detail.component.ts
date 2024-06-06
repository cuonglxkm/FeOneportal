import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { OrderService } from '../../../shared/services/order.service';
import { OrderDTOSonch } from '../../../shared/models/order.model';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotificationService, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import {getCurrentRegionAndProject} from "@shared";
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

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
  titleStepFour: string = this.i18n.fanyi("app.order.status.Installed");;
  serviceName: string
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private service: OrderService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
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
              this.titleStepFour = this.i18n.fanyi("app.order.status.Success");
            } else if (this.data.statusCode == 5) {
              if (this.data.invoiceCode != '') {
                this.titleStepFour = this.i18n.fanyi("app.order.status.Trouble");
              } else {
                this.titleStepFour = '';
              }
            } else {
              this.titleStepFour = this.i18n.fanyi("app.order.status.Installed");
            }
          })
        )
        .subscribe({
          next: (data) => {
            this.data = data;
            data?.orderItems?.forEach((item) => {
              this.serviceName = item.serviceName.split('-')[0].trim()
              if(this.serviceName.includes('Máy ảo')){
                this.serviceName = 'VM'
              }
            });          
          },
          error: (e) => {
            this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.failData"));
          },
        });
    } else {
      const idParse = parseInt(this.id);
      this.service
        .getDetail(idParse)
        .pipe(
          finalize(() => {
            if (this.data.statusCode == 4) {
              this.titleStepFour = this.i18n.fanyi("app.order.status.Success");
            } else if (this.data.statusCode == 5) {
              if (this.data.invoiceCode != '') {
                this.titleStepFour = this.i18n.fanyi("app.order.status.Trouble");;
              } else {
                this.titleStepFour = '';
              }
            } else {
              this.titleStepFour = this.i18n.fanyi("app.order.status.Installed");
            }
          })
        )
        .subscribe({
          next: (data) => {
            this.data = data;
            data?.orderItems?.forEach((item) => {
              this.serviceName = item.serviceName.split('-')[0].trim()
              if(this.serviceName.includes('Máy ảo')){
                item.serviceNameLink = 'VM'
              }else{
                item.serviceNameLink = this.serviceName
              }
            })
            console.log(data);
            
          },
          error: (e) => {
            this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.failData"));
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

  pay(){
    window.location.href = this.data.paymentUrl
  }
}
