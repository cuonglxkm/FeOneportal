import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { OrderService } from '../../../shared/services/order.service';
import { OrderDTOSonch } from '../../../shared/models/order.model';
import { finalize, Observable, shareReplay, tap } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotificationService, ProjectModel, RegionModel, UserModel } from '../../../../../../../libs/common-utils/src';
import {getCurrentRegionAndProject} from "@shared";
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { environment } from '@env/environment';

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
  userModel$: Observable<UserModel>;
  userModel: UserModel
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private service: OrderService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getUser()
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

  getUser(){
    let email = this.tokenService.get()?.email;
  const accessToken = this.tokenService.get()?.token;

  let baseUrl = environment['baseUrl'];
  this.userModel$ = this.http.get<UserModel>(`${baseUrl}/users/${email}`, {
    headers: new HttpHeaders({
      Authorization: 'Bearer ' + accessToken,
    }),
  }).pipe(
    tap(user => {
      this.userModel = user;
      console.log(this.userModel);
      
    }),
    shareReplay(1) 
  );
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
