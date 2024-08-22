import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { environment } from '@env/environment';
import { getCurrentRegionAndProject } from "@shared";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, finalize, Observable, shareReplay, tap } from 'rxjs';
import { NotificationService, ProjectModel, RegionModel, UserModel } from '../../../../../../../libs/common-utils/src';
import { OrderDetailDTO } from '../../../shared/models/order.model';
import { OrderService } from '../../../shared/services/order.service';
import { LoadingService } from '@delon/abc/loading';
import { DataPayment, ItemPayment } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { OrderItem } from 'src/app/shared/models/price';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'one-portal-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.less'],
})
export class OrderDetailComponent {
  id: any;
  regionId: any;
  projectId: any;
  data: OrderDetailDTO;
  currentStep = 1;
  titleStepFour: string = this.i18n.fanyi("app.order.status.Installed");
  serviceName: string
  isVisibleConfirm: boolean = false;
  isLoadingCancelOrder: boolean = false;
  userModel$: Observable<UserModel>;
  userModel: UserModel
  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;
  specType: string
  isLoadingTotalAmount: boolean = false
  isIppublic = true
  serviceSpec: any
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private service: OrderService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private http: HttpClient,
    private loadingSrv: LoadingService,
    private instanceService: InstancesService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getUser()
    this.getOrderDetail()

    this.notificationService.connection.on('UpdateOrder', (data) => {
      if (data.statusCode) {
        this.data.statusCode = data.statusCode;
        this.cdr.detectChanges();
        console.log(this.data.statusCode);
      }
    });

    this.notificationService.connection.on('UpdateStatePayment', (data) => {
      if(data && data["serviceId"] && Number(data["serviceId"]) == this.data.paymentId){
        this.data.paymentCode = "";
        this.data.paymentId = 0;
        this.data.paymentUrl = "";
        this.cdr.detectChanges();
      }
    });
  }

  setTitleStepFour() {
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
  }

  getOrderDetail(){
    const url = this.id.split('-');
    this.isLoadingTotalAmount = true
    if (url.length > 1) {
      this.service
        .getOrderBycode(this.id)
        .subscribe({
          next: (data) => {
            this.data = data;
            this.getSpecType()
            if(this.data.paymentUrl === '' && this.data.statusCode == 0 && this.specType !== undefined){
              this.getTotalAmount()
              this.isLoadingTotalAmount = false
            }
            data?.orderItems?.forEach((item) => {

              this.serviceName = item.serviceName.split('-')[0].trim()
              let serviceName1 = item.serviceName.split('-')[1]
              if(this.serviceName.includes('Snapshot Package')) {
                item.serviceName = `Gói Snapshot - ${serviceName1}`;
              }
              if(this.serviceName.includes('Máy ảo')){
                item.serviceNameLink = 'VM'
              } else if(this.serviceName.includes('K8s Premium')) {
                item.serviceNameLink = 'VPK';
              }
              else{
                item.serviceNameLink = this.serviceName
              }
            })

            this.serviceSpec = JSON.parse(data?.orderItems[0]?.serviceDetail);

            if(data.statusCode == 1){
              data.statusCode = 6
            }else if(data.statusCode == 0){
              data.statusCode = 1
            }

            this.setTitleStepFour()

            this.isLoadingTotalAmount = false
          },
          error: (e) => {
            this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.failData"));
            this.router.navigate(['/app-smart-cloud/order']);
          },
        });
    } else {
      const idParse = parseInt(this.id);
      this.service
        .getDetail(idParse)
        .subscribe({
          next: (data) => {
            let obj = JSON.parse(data?.orderItems[0]?.serviceDetail);
            if (obj != null && obj.IsFloating === true) {
              this.isIppublic = false;
            } else {
              this.isIppublic = true;
            }
            this.data = data;
            this.getSpecType()
            if(this.data.paymentUrl === '' && this.data.statusCode == 0  && this.specType !== undefined){
              this.getTotalAmount()
              this.isLoadingTotalAmount = false
            }
            data?.orderItems?.forEach((item) => {
              this.serviceName = item.serviceName.split('-')[0].trim()
              let serviceName1 = item.serviceName.split('-')[1]
              if(this.serviceName.includes('Snapshot Package')) {
                item.serviceName = `Gói Snapshot - ${serviceName1}`;
              }
              if(this.serviceName.includes('Máy ảo')){
                item.serviceNameLink = 'VM'
              } else if(this.serviceName.includes('K8s Premium')) {
                item.serviceNameLink = 'VPK';
              } 
              else{
                item.serviceNameLink = this.serviceName
              }
            })

            this.serviceSpec = JSON.parse(data?.orderItems[0]?.serviceDetail);
            console.log(this.serviceSpec);
            

            if(data.statusCode == 1){
              data.statusCode = 6
            }else if(data.statusCode == 0){
              data.statusCode = 1
            }

            this.setTitleStepFour()
            this.isLoadingTotalAmount = false
          },
          error: (e) => {
            this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.failData"));
            this.router.navigate(['/app-smart-cloud/order']);
          },
        });
    }
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
    this.router.navigate(['/app-smart-cloud/order'])
  }

  pay(){
    if (this.data.paymentUrl == '') {
      this.createNewPayment(this.id);


    } else {
      window.location.href = this.data.paymentUrl;
    }
  }

  handleCancelConfirm() {
    this.isVisibleConfirm = false;
  }

  cancelOrder(){
    this.isVisibleConfirm = true;
  }

  handleOk(){
    this.isLoadingCancelOrder = true;
    this.service.cancelOrder(this.data.id).subscribe({
      next: (data) => {
        this.isVisibleConfirm = false;
        this.isLoadingCancelOrder = false
        this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.order-detail.cancelOrder.success"));
        setTimeout(() => {
          window.location.reload();
        }, 1000)
      },
      error: (e) => {
        this.isLoadingCancelOrder = false
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.order-detail.cancelOrder.fail"));
      },
    })
  }

  createNewPayment(id: number){
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.service.createNewPayment(id).pipe(
      finalize(() => {
        this.loadingSrv.close()
      })
    ).subscribe({
      next: (data) => {
        window.location.href = data.data
      },
      error: (e) => {

      },
    })
  }

  getSpecType(){
    let serviceName = this.data.orderItems[0].serviceName.split('-')[0].trim()
    if(serviceName.includes('Máy ảo')){
      serviceName = 'VM'
    }
    console.log(serviceName);
    if(serviceName === 'Backup vm' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'instancebackup_create'
    }else if(serviceName === 'Backup vm' && this.data.orderItems[0].serviceType === 'Khôi phục'){
      this.specType = 'instancebackup_restore'
    }else if(serviceName === 'VPNSiteToSites' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'vpnsitetosite_extend'
    }else if(serviceName === 'VPNSiteToSites' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'vpnsitetosite_resize'
    }else if(serviceName === 'VPNSiteToSites' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'vpnsitetosite_create'
    }else if(serviceName === 'Snapshot Package' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'snapshotpackage_create'
    }else if(serviceName === 'Snapshot Package' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'snapshotpackage_extend'
    }else if(serviceName === 'Snapshot Package' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'snapshotpackage_resize'
    }else if(serviceName === 'Mongodb' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'mongodb_create'
    }else if(serviceName === 'Mongodb' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'mongodb_extend'
    }else if(serviceName === 'Mongodb' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'mongodb_resize'
    }else if(serviceName === 'ECR' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'ecr_create'
    }else if(serviceName === 'ECR' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'ecr_extend'
    }else if(serviceName === 'ECR' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'ecr_resize'
    }else if(serviceName === 'VPK' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'k8s_prem_create'
    }else if(serviceName === 'VPK' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'k8s_prem_extend'
    }else if(serviceName === 'VPK' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'k8s_prem_resize'
    }else if(serviceName === 'File system snapshot' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'sharesnapshot_create'
    }else if(serviceName === 'File system snapshot' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'sharesnapshot_extend'
    }else if(serviceName === 'IP' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'ip_create'
    }else if(serviceName === 'IP' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'ip_create'
    }else if(serviceName === 'Volume' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'volume_create'
    }else if(serviceName === 'Volume' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'volume_extend'
    }else if(serviceName === 'Volume' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'volume_resize'
    }else if(serviceName === 'Vpc' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'vpc_create'
    }else if(serviceName === 'Vpc' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'vpc_extend'
    }else if(serviceName === 'Vpc' && this.data.orderItems[0].serviceType === 'Điều chỉnh cấu hình'){
      this.specType = 'vpc_resize'
    }else if(serviceName === 'Object Storage' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'objectstorage_create'
    }else if(serviceName === 'Object Storage' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'objectstorage_extend'
    }else if(serviceName === 'Object Storage' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'objectstorage_resize'
    }else if(serviceName === 'File Storage' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'filestorage_create'
    }else if(serviceName === 'File Storage' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'filestorage_extend'
    }else if(serviceName === 'File Storage' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'filestorage_resize'
    }else if(serviceName === 'Loadbalancer SDN' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'loadbalancer_create'
    }else if(serviceName === 'Loadbalancer SDN' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'loadbalancer_extend'
    }else if(serviceName === 'Loadbalancer SDN' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'loadbalancer_resize'
    }else if(serviceName === 'Backup Packet' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'backuppackage_create'
    }else if(serviceName === 'Backup Packet' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'backuppackage_extend'
    }else if(serviceName === 'Backup Packet' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'backuppackage_resize'
    }else if(serviceName === 'K8s' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'k8s_create'
    }else if(serviceName === 'K8s' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'k8s_extend'
    }else if(serviceName === 'K8s' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'k8s_resize'
    }else if(serviceName === 'WAF' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'waf_create'
    }else if(serviceName === 'WAF' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'waf_extend'
    }else if(serviceName === 'WAF' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'waf_resize'
    }else if(serviceName === 'Kafka' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'kafka_create'
    }else if(serviceName === 'Kafka' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'kafka_extend'
    }else if(serviceName === 'Kafka' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'kafka_resize'
    }else if(serviceName === 'Volume Snapshot' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'volumesnapshot_create'
    }else if(serviceName === 'Volume Backup' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'volumebackup_create'
    }else if(serviceName === 'Volume Backup' && this.data.orderItems[0].serviceType === 'Khôi phục'){
      this.specType = 'restore_volumebackup'
    }else if(serviceName === 'VM' && this.data.orderItems[0].serviceType === 'Tạo mới'){
      this.specType = 'instance_create'
    }else if(serviceName === 'VM' && this.data.orderItems[0].serviceType === 'Gia hạn'){
      this.specType = 'instance_extend'
    }else if(serviceName === 'VM' && this.data.orderItems[0].serviceType.includes('Điều chỉnh')){
      this.specType = 'instance_resize'
    }
  }

  getTotalAmount() {
    this.getSpecType()
    const specificationObj = JSON.parse(this.data.orderItems[0].serviceDetail);
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = this.data.orderItems[0].quantity;
    itemPayment.specificationString = this.data.orderItems[0].serviceDetail;
    itemPayment.specificationType = this.specType;
    itemPayment.serviceDuration = this.data.orderItems[0].duration;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = specificationObj.ProjectId === null ? 0 : specificationObj.ProjectId;

    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      this.orderItem = result.data;
      if (!this.orderItem || !this.orderItem.orderItemPrices || !this.orderItem.orderItemPrices[0]) {
        return;
      }

      console.log(this.orderItem?.totalPayment?.amount);
      this.unitPrice = this.orderItem.orderItemPrices[0]?.unitPrice?.amount;
    }, (error) => {
      this.notification.error(this.i18n.fanyi("app.status.fail"), 'Lấy tiền thất bại');
    });
  }

  navigateToInstanceList(){
    this.commonService.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')
  }
}
