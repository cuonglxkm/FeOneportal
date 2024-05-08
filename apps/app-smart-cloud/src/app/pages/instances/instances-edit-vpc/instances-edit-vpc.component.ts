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
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoadingService } from '@delon/abc/loading';
import {
  ProjectModel,
  RegionModel,
} from '../../../../../../../libs/common-utils/src';
import { TotalVpcResource } from 'src/app/shared/models/vpc.model';
import { getCurrentRegionAndProject } from '@shared';

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
    private dataService: InstancesService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public message: NzMessageService,
    private notification: NzNotificationService
  ) {}

  checkPermission: boolean = false;
  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId;
    this.userEmail = this.tokenService.get()?.email;
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.getInfoVPC();
    this.activatedRoute.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService.getById(this.id, true).subscribe({
          next: (data: any) => {
            this.instancesModel = data;
            this.loading = false;
            this.cloudId = this.instancesModel.cloudId;
            this.regionId = this.instancesModel.regionId;
            this.getListIpPublic();
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
          },
          error: (e) => {
            this.checkPermission = false;
            this.notification.error(e.error.detail, '');
            this.returnPage();
          },
        });
      }
    });
  }

  infoVPC: TotalVpcResource;
  remainingRAM: number = 0;
  remainingVolume: number = 0;
  purchasedVolume: number = 0;
  remainingVCPU: number = 0;
  getInfoVPC() {
    this.dataService.getInfoVPC(this.projectId).subscribe({
      next: (data) => {
        this.infoVPC = data;
        if (this.instancesModel.volumeType == 0) {
          this.purchasedVolume = this.infoVPC.cloudProject.quotaHddInGb;
          this.remainingVolume =
            this.infoVPC.cloudProject.quotaHddInGb -
            this.infoVPC.cloudProjectResourceUsed.hdd;
        } else {
          this.purchasedVolume = this.infoVPC.cloudProject.quotaSSDInGb;
          this.remainingVolume =
            this.infoVPC.cloudProject.quotaSSDInGb -
            this.infoVPC.cloudProjectResourceUsed.ssd;
        }
        this.remainingRAM =
          this.infoVPC.cloudProject.quotaRamInGb -
          this.infoVPC.cloudProjectResourceUsed.ram;
        this.remainingVCPU =
          this.infoVPC.cloudProject.quotavCpu -
          this.infoVPC.cloudProjectResourceUsed.cpu;
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Lấy thông tin VPC không thành công'
        );
      },
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

  vCPU: number = 0;
  ram: number = 0;
  storage: number = 0;
  instanceResize: InstanceResize = new InstanceResize();
  instanceResizeInit() {
    this.instanceResize.description = null;
    this.instanceResize.currentFlavorId = this.instancesModel.flavorId;
    this.instanceResize.cpu = this.vCPU + this.instancesModel.cpu;
    this.instanceResize.ram = this.ram + this.instancesModel.ram;
    this.instanceResize.storage = this.storage + this.instancesModel.storage;
    this.instanceResize.addBtqt = 0;
    this.instanceResize.addBttn = 0;
    this.instanceResize.serviceInstanceId = this.instancesModel.id;
    this.instanceResize.regionId = this.regionId;
    this.instanceResize.serviceName = this.instancesModel.name;
    this.instanceResize.customerId = this.userId;
    this.instanceResize.projectId = this.projectId;
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

  isChange: boolean = false;
  checkChangeConfig() {
    if (this.storage != 0 || this.ram != 0 || this.vCPU != 0) {
      this.isChange = true;
    } else {
      this.isChange = false;
    }
  }

  onRegionChange(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  onProjectChange(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  cancel() {
    this.router.navigate(['/app-smart-cloud/instances']);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/instances/instances-create-vpc']);
  }

  navigateToChangeImage() {
    this.router.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.id,
    ]);
  }

  returnPage(): void {
    this.router.navigate(['/app-smart-cloud/instances']);
  }
}
