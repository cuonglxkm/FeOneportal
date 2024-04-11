import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  InstanceResize,
  InstancesModel,
  Network,
  Order,
  OrderItem,
  SecurityGroupModel,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InstancesService } from '../instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { G2TimelineData } from '@delon/chart/timeline';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { RegionModel } from 'src/app/shared/models/region.model';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoadingService } from '@delon/abc/loading';

@Component({
  selector: 'one-portal-instances-edit-vpc',
  templateUrl: './instances-edit-vpc.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesEditVpcComponent implements OnInit {
  loading = true;

  instancesModel: InstancesModel;
  id: number;
  userId: number;
  userEmail: string;
  cloudId: string;
  regionId: number;
  projectId: number;
  listSecurityGroupModel: SecurityGroupModel[] = [];
  listSecurityGroup: SecurityGroupModel[] = [];

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public message: NzMessageService,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService
  ) {}

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = `0${date.getUTCMonth() + 1}`.slice(-2);
    const day = `0${date.getUTCDate()}`.slice(-2);
    const hours = `0${date.getUTCHours()}`.slice(-2);
    const minutes = `0${date.getUTCMinutes()}`.slice(-2);
    const seconds = `0${date.getUTCSeconds()}`.slice(-2);
    const milliseconds = `00${date.getUTCMilliseconds()}`.slice(-3);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  }

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId;
    this.userEmail = this.tokenService.get()?.email;
    this.activatedRoute.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService.getById(this.id, true).subscribe((data: any) => {
          this.instancesModel = data;
          this.loading = false;
          this.cloudId = this.instancesModel.cloudId;
          this.regionId = this.instancesModel.regionId;
          this.getListIpPublic();
          this.getAllSecurityGroup();
          this.dataService
            .getAllSecurityGroupByInstance(
              this.cloudId,
              this.regionId,
              this.instancesModel.customerId,
              this.instancesModel.projectId
            )
            .subscribe((datasg: any) => {
              this.listSecurityGroupModel = datasg;
              this.cdr.detectChanges();
            });
          this.cdr.detectChanges();
        });
      }
    });
  }

  listIPPublicStr = '';
  listIPLanStr = '';
  getListIpPublic() {
    this.dataService
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

  vCPU: number;
  ram: number;
  storage: number;
  instanceResize: InstanceResize = new InstanceResize();
  instanceResizeInit() {
    this.instanceResize.description = null;
    this.instanceResize.currentFlavorId = this.instancesModel.flavorId;
    this.instanceResize.cpu = this.vCPU + this.instancesModel.cpu;
    this.instanceResize.ram = this.ram + this.instancesModel.ram;
    this.instanceResize.storage = this.storage + this.instancesModel.storage;
    this.instanceResize.addBtqt = 0;
    this.instanceResize.addBttn = 0;
    this.instanceResize.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.InstanceResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.instanceResize.serviceType = 1;
    this.instanceResize.actionType = 4;
    this.instanceResize.serviceInstanceId = this.instancesModel.id;
    this.instanceResize.regionId = this.regionId;
    this.instanceResize.serviceName = null;
    this.instanceResize.customerId = this.userId;
    this.instanceResize.projectId = this.projectId;
    this.instanceResize.userEmail = this.userEmail;
    this.instanceResize.actorEmail = this.userEmail;
  }

  order: Order = new Order();
  orderItem: OrderItem[] = [];
  update() {
    this.instanceResizeInit();
    let specificationInstance = JSON.stringify(this.instanceResize);
    let orderItemInstanceResize = new OrderItem();
    orderItemInstanceResize.orderItemQuantity = 1;
    orderItemInstanceResize.specification = specificationInstance;
    orderItemInstanceResize.specificationType = 'instance_resize';
    this.orderItem.push(orderItemInstanceResize);

    this.order.customerId = this.userId;
    this.order.createdByUserId = this.userId;
    this.order.note = 'instance resize';
    this.order.orderItems = this.orderItem;
    console.log('order instance resize', this.order);

    this.dataService.create(this.order).subscribe({
      next: (data: any) => {
        this.notification.success('', 'Cập nhật máy ảo hành công');
        this.router.navigate(['/app-smart-cloud/instances']);
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Cập nhật máy ảo không thành công'
        );
      },
    });
  }

  onRegionChange(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  userChangeProject() {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  cancel() {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  navigateToChangeImage() {
    this.router.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.id,
    ]);
  }

  returnPage(): void {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  getAllSecurityGroup() {
    this.dataService
      .getAllSecurityGroup(
        this.regionId,
        this.tokenService.get()?.userId,
        this.projectId
      )
      .subscribe((data: any) => {
        this.listSecurityGroup = data;
        this.cdr.detectChanges();
      });
  }
}
