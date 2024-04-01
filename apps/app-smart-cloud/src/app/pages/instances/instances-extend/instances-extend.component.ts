import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
} from '@angular/core';
import {
  DataPayment,
  InstanceExtend,
  InstancesModel,
  ItemPayment,
  Network,
  Order,
  OrderItem,
  SecurityGroupModel,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { InstancesService } from '../instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { debounceTime, finalize, Subject } from 'rxjs';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'one-portal-instances-extend',
  templateUrl: './instances-extend.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstancesExtendComponent implements OnInit {
  loading = true;
  instancesModel: InstancesModel;
  listSecurityGroupModel: SecurityGroupModel[] = [];
  id: number;
  regionId: number;
  customerId: number;
  email: string;
  instanceExtend: InstanceExtend = new InstanceExtend();
  numberMonth: number = 1;
  newExpiredDate: string;
  order: Order = new Order();
  orderItem: OrderItem[] = [];
  isDisable = true;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private service: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalSrv: NzModalService,
    private loadingSrv: LoadingService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.customerId = this.tokenService.get()?.userId;
    this.email = this.tokenService.get()?.email;
    this.id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.service.getById(this.id, true).subscribe((data) => {
      this.instancesModel = data;
      this.regionId = this.instancesModel.regionId;
      this.loading = false;
      this.getListIpPublic();
      this.getTotalAmount();
      this.service
        .getAllSecurityGroupByInstance(
          this.instancesModel.cloudId,
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
    this.onChangeTime();
  }

  listIPPublicStr = '';
  listIPLanStr = '';
  getListIpPublic() {
    this.service
      .getPortByInstance(this.id, this.regionId)
      .subscribe((dataNetwork: any) => {
        //list IP public
        let listOfPublicNetwork: Network[] = dataNetwork.filter(
          (e: Network) => e.isExternal == true
        );
        let listIPPublic: string[] = [];
        listOfPublicNetwork.forEach((e) => {
          listIPPublic = listIPPublic.concat(e.fixedIPs);
        });
        this.listIPPublicStr = listIPPublic.join(', ');

        //list IP Lan
        let listOfPrivateNetwork: Network[] = dataNetwork.filter(
          (e: Network) => e.isExternal == false
        );
        let listIPLan: string[] = [];
        listOfPrivateNetwork.forEach((e) => {
          listIPLan = listIPLan.concat(e.fixedIPs);
        });
        this.listIPLanStr = listIPLan.join(', ');
        this.cdr.detectChanges();
      });
  }

  dataSubjectTime: Subject<any> = new Subject<any>();
  changeTime(value: number) {
    this.dataSubjectTime.next(value);
  }
  onChangeTime() {
    this.dataSubjectTime
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        if (res == 0) {
          this.isDisable = true;
          this.totalAmount = 0;
          this.totalincludesVAT = 0;
          this.newExpiredDate = '';
        } else {
          let expiredDate = new Date(this.instancesModel.expiredDate);
          expiredDate.setDate(expiredDate.getDate() + this.numberMonth * 30);
          this.newExpiredDate = expiredDate.toISOString().substring(0, 19);
          this.getTotalAmount();
        }
      });
  }

  instanceExtendInit() {
    this.instanceExtend.regionId = this.regionId;
    this.instanceExtend.serviceName = 'Gia hạn';
    this.instanceExtend.customerId = this.customerId;
    this.instanceExtend.vpcId = this.instancesModel.projectId;
    this.instanceExtend.typeName =
      'SharedKernel.IntegrationEvents.InstanceExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.instanceExtend.serviceType = 1;
    this.instanceExtend.actionType = 3;
    this.instanceExtend.serviceInstanceId = this.instancesModel.id;
    this.instanceExtend.newExpireDate = this.newExpiredDate;
    this.instanceExtend.userEmail = this.email;
    this.instanceExtend.actorEmail = this.email;
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  getTotalAmount() {
    this.isDisable = true;
    this.instanceExtendInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.instanceExtend);
    itemPayment.specificationType = 'instance_extend';
    itemPayment.serviceDuration = this.numberMonth;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.instancesModel.projectId;
    console.log('dataPayment extend', dataPayment);
    this.service.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien', result);
      this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
      this.totalincludesVAT = Number.parseFloat(
        result.data.totalPayment.amount
      );
      this.isDisable = false;
      this.cdr.detectChanges();
    });
  }

  handleOkExtend(): void {
    this.instanceExtendInit();
    let specificationInstance = JSON.stringify(this.instanceExtend);
    let orderItemInstanceResize = new OrderItem();
    orderItemInstanceResize.orderItemQuantity = 1;
    orderItemInstanceResize.specification = specificationInstance;
    orderItemInstanceResize.specificationType = 'instance_extend';
    orderItemInstanceResize.price = this.totalAmount / this.numberMonth;
    orderItemInstanceResize.serviceDuration = this.numberMonth;
    this.orderItem.push(orderItemInstanceResize);

    this.order.customerId = this.customerId;
    this.order.createdByUserId = this.customerId;
    this.order.note = 'instance extend';
    this.order.orderItems = this.orderItem;
    console.log('order instance resize', this.order);

    var returnPath: string = window.location.pathname;
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: this.order, path: returnPath },
    });
  }

  onRegionChange(region: any) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  onProjectChange(project: any) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  navigateToEdit() {
    this.router.navigate([
      '/app-smart-cloud/instances/instances-edit/' + this.id,
    ]);
  }

  cancel() {
    this.router.navigate([
      '/app-smart-cloud/instances/instances-detail/' + this.id,
    ]);
  }
}
