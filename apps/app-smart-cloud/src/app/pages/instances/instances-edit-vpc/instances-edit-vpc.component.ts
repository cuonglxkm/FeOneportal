import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  GpuConfigRecommend,
  GpuProject,
  GpuUsage,
  InfoVPCModel,
  InstanceResize,
  InstancesModel,
  Network,
  OfferItem,
  Order,
  OrderItem,
  SecurityGroupModel,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { InstancesService } from '../instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject, getListGpuConfigRecommend } from '@shared';
import {
  RegionModel,
  ProjectModel,
} from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { debounceTime, finalize, Subject } from 'rxjs';
import { ConfigurationsService } from 'src/app/shared/services/configurations.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'one-portal-instances-edit-vpc',
  templateUrl: './instances-edit-vpc.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesEditVpcComponent implements OnInit {
  instancesModel: InstancesModel;
  id: number;
  userId: number;
  userEmail: string;
  cloudId: string;
  region: number;
  projectId: number;
  listSecurityGroupModel: SecurityGroupModel[] = [];
  listSecurityGroup: SecurityGroupModel[] = [];
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); // Ngăn chặn hành vi mặc định của các phím mũi tên

      const tabs = document.querySelectorAll('.ant-tabs-tab'); // Lấy danh sách các tab
      const activeTab = document.querySelector('.ant-tabs-tab-active'); // Lấy tab đang active

      // Tìm index của tab đang active
      let activeTabIndex = Array.prototype.indexOf.call(tabs, activeTab);

      if (event.key === 'ArrowLeft') {
        activeTabIndex -= 1; // Di chuyển tới tab trước đó
      } else if (event.key === 'ArrowRight') {
        activeTabIndex += 1; // Di chuyển tới tab tiếp theo
      }

      // Kiểm tra xem tab có hợp lệ không
      if (activeTabIndex >= 0 && activeTabIndex < tabs.length) {
        (tabs[activeTabIndex] as HTMLElement).click(); // Kích hoạt tab mới
      }
    }
  }

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
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private dataService: InstancesService,
    private catalogService: CatalogService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private notification: NzNotificationService,
    private configurationService: ConfigurationsService,
    private orderService: OrderService,
    private commonService: CommonService
  ) {}
  url = window.location.pathname;

  checkPermission: boolean = false;
  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId;
    this.userEmail = this.tokenService.get()?.email;
    this.id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.region = RegionID.ADVANCE;
    }
    this.getActiveServiceByRegion();
    this.getInfoVPC();
    this.onChangeCapacity();
  }

  //Lấy các dịch vụ hỗ trợ theo region
  isVmGpu: boolean = false;
  getActiveServiceByRegion() {
    this.catalogService
      .getActiveServiceByRegion(['Encryption', 'vm-gpu'], this.region)
      .subscribe((data) => {
        console.log('support service', data);
        this.isVmGpu = data.filter(
          (e) => e.productName == 'vm-gpu'
        )[0].isActive;
      });
  }

  isCurrentConfigGpu: boolean = false;
  gpuTypeNameAtIntial: string = '';
  getCurrentInfoInstance(): void {
    this.listOptionGpuValue = this.listOptionGpuValue.filter(
      (e) => e >= this.instancesModel.gpuCount
    );
    this.cloudId = this.instancesModel.cloudId;
    this.region = this.instancesModel.regionId;
    if (
      this.instancesModel.gpuCount != null &&
      this.instancesModel.gpuType != null
    ) {
      this.isCurrentConfigGpu = true;
      this.isGpuConfig = true;
      this.isCustomconfig = false;
      this.gpuOfferId = this.purchasedListGPUType.filter(
        (e) =>
          e.characteristicValues[0].charOptionValues[0] ==
          this.instancesModel.gpuType
      )[0].id;

      this.gpuTypeNameAtIntial = this.purchasedListGPUType.filter(
        (e) => e.id == this.gpuOfferId
      )[0].offerName;

      this.gpuTypeName = this.purchasedListGPUType.filter(
        (e) => e.id == this.gpuOfferId
      )[0].offerName;

      let gpuProject: GpuProject = this.infoVPC.cloudProject.gpuProjects.filter(
        (e) => e.gpuOfferId == this.gpuOfferId
      )[0];
      this.purchasedGpu = gpuProject.gpuCount;
      let gpuUsage: GpuUsage =
        this.infoVPC.cloudProjectResourceUsed.gpuUsages.filter(
          (e) => e.gpuOfferId == this.gpuOfferId
        )[0];
      if (gpuUsage) {
        this.remainingGpu = gpuProject.gpuCount - gpuUsage.gpuCount;
      } else {
        this.remainingGpu = gpuProject.gpuCount;
      }
    } else {
      this.isCurrentConfigGpu = false;
    }
    this.dataService
      .getAllSecurityGroupByInstance(
        this.cloudId,
        this.region,
        this.instancesModel.customerId,
        this.instancesModel.projectId
      )
      .subscribe((datasg: any) => {
        this.listSecurityGroupModel = datasg;
        this.cdr.detectChanges();
      });
    console.log('so du gpu', this.remainingGpu);
    this.listOptionGpuValue = this.listOptionGpuValue.filter(
      (e) => e <= this.remainingGpu + this.instancesModel.gpuCount
    );
    this.instanceResize.gpuCount = this.instancesModel.gpuCount;
    this.configRecommend = this.listGpuConfigRecommend.filter(
      (e) =>
        e.id == this.gpuOfferId && e.gpuCount == this.instanceResize.gpuCount
    )[0];
    this.cdr.detectChanges();
  }

  listOptionGpuValue: any[];
  getListOptionGpuValue() {
    this.configurationService
      .getConfigurations('OPTIONGPUVALUE')
      .subscribe((data) => {
        this.listOptionGpuValue = data.valueString.split(', ').map(Number);
        this.getCurrentInfoInstance();
      });
  }

  configRecommend: GpuConfigRecommend;
  listGpuConfigRecommend: GpuConfigRecommend[] = [];
  listGPUType: OfferItem[] = [];
  purchasedListGPUType: OfferItem[] = [];
  getListGpuType() {
    this.dataService
      .getListOffers(this.region, 'vm-flavor-gpu')
      .subscribe((data) => {
        this.listGPUType = data?.filter(
          (e: OfferItem) => e.status.toUpperCase() == 'ACTIVE'
        );
        if (this.listGPUType) {
          this.listGpuConfigRecommend = getListGpuConfigRecommend(
            this.listGPUType
          );
        }
        console.log('list gpu config recommend', this.listGpuConfigRecommend);
        let listGpuOfferIds: number[] = [];
        this.infoVPC.cloudProject.gpuProjects.forEach((gputype) =>
          listGpuOfferIds.push(gputype.gpuOfferId)
        );
        this.purchasedListGPUType = this.listGPUType?.filter((e) =>
          listGpuOfferIds.includes(e.id)
        );
        this.getListOptionGpuValue();
      });
  }

  infoVPC: InfoVPCModel;
  remainingRAM: number = 0;
  remainingVolume: number = 0;
  purchasedVolume: number = 0;
  purchasedGpu: number = 0;
  remainingVCPU: number = 0;
  remainingGpu: number = 0;
  maxSizeVolume: number = 0;
  maxSizeRam: number = 0;
  maxSizeVCpu: number = 0
  getInfoVPC() {
    this.dataService.getById(this.id, true).subscribe({
      next: (ressultModel: any) => {
        this.instancesModel = ressultModel;
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
            this.maxSizeVolume =
              this.remainingVolume + this.instancesModel.storage;
            this.maxSizeRam = this.remainingRAM + this.instancesModel.ram;
            this.maxSizeVCpu = this.remainingVCPU + this.instancesModel.cpu;
            this.ram = ressultModel.ram;
            this.storage = ressultModel.storage;
            this.vCPU = ressultModel.cpu;
            this.getListGpuType();
            this.getConfigurations();
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.notify.get.vpc.info.fail')
            );
          },
        });
      },
      error: (e) => {
        this.checkPermission = false;
        this.notification.error('', e.error.message);
        this.returnPage();
      },
    });
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  isCustomconfig = true;
  isGpuConfig = false;
  onClickCustomConfig() {
    this.isCustomconfig = true;
    this.isGpuConfig = false;
    this.resetData();
    this.checkChangeConfig();
  }

  onClickGpuConfig() {
    if (this.isCurrentConfigGpu) {
      return;
    } else {
      this.isCustomconfig = false;
      this.isGpuConfig = true;
      this.resetData();
      this.gpuOfferId = this.purchasedListGPUType[0].id;
      this.gpuTypeName = this.purchasedListGPUType.filter(
        (e) => e.id == this.gpuOfferId
      )[0].offerName;

      let gpuProject: GpuProject = this.infoVPC.cloudProject.gpuProjects.filter(
        (e) => e.gpuOfferId == this.gpuOfferId
      )[0];
      this.purchasedGpu = gpuProject.gpuCount;
      let gpuUsage: GpuUsage =
        this.infoVPC.cloudProjectResourceUsed.gpuUsages.filter(
          (e) => e.gpuOfferId == this.gpuOfferId
        )[0];
      if (gpuUsage) {
        this.remainingGpu = gpuProject.gpuCount - gpuUsage.gpuCount;
      } else {
        this.remainingGpu = gpuProject.gpuCount;
      }
      this.getListOptionGpuValue();
    }
    this.checkChangeConfig();
    this.cdr.detectChanges();
  }

  gpuTypeName: string = '';
  changeGpuType(id: number) {
    this.gpuTypeName = this.purchasedListGPUType.filter(
      (e) => e.id == id
    )[0].offerName;

    let gpuProject: GpuProject = this.infoVPC.cloudProject.gpuProjects.filter(
      (e) => e.gpuOfferId == id
    )[0];
    this.purchasedGpu = gpuProject.gpuCount;

    let gpuUsage: GpuUsage =
      this.infoVPC.cloudProjectResourceUsed.gpuUsages.filter(
        (e) => e.gpuOfferId == id
      )[0];

    if (gpuUsage) {
      this.remainingGpu = gpuProject.gpuCount - gpuUsage.gpuCount;
    } else {
      this.remainingGpu = gpuProject.gpuCount;
    }
    this.getListOptionGpuValue();
    this.instanceResize.gpuCount = 0;
    this.configRecommend = null;
  }

  changeGpu() {
    this.configRecommend = this.listGpuConfigRecommend.filter(
      (e) =>
        e.id == this.gpuOfferId && e.gpuCount == this.instanceResize.gpuCount
    )[0];
    console.log('cấu hình đề recommend', this.configRecommend);
  }

  resetData() {
    this.vCPU = 0;
    this.storage = 0;
    this.ram = 0;
    this.instanceResize.gpuCount = this.instancesModel.gpuCount;
    this.configRecommend = this.listGpuConfigRecommend.filter(
      (e) =>
        e.id == this.gpuOfferId && e.gpuCount == this.instanceResize.gpuCount
    )[0];
  }

  vCPU: number = 0;
  ram: number = 0;
  storage: number = 0;
  gpuOfferId: number = 0;
  instanceResize: InstanceResize = new InstanceResize();
  instanceResizeInit() {
    this.instanceResize.description = null;
    this.instanceResize.currentFlavorId = this.instancesModel.flavorId;
    if (this.isCustomconfig) {
      this.instanceResize.cpu = this.vCPU;
      this.instanceResize.ram = this.ram;
      this.instanceResize.storage = this.storage;
    } else if (this.isGpuConfig) {
      this.instanceResize.cpu = this.vCPU;
      this.instanceResize.ram = this.ram;
      this.instanceResize.storage = this.storage;
      if (this.gpuOfferId) {
        this.instanceResize.gpuType = this.purchasedListGPUType.filter(
          (e) => e.id == this.gpuOfferId
        )[0].characteristicValues[0].charOptionValues[0];
      } else {
        this.instanceResize.gpuType = this.instancesModel.gpuType;
      }
      this.instanceResize.newGpuOfferId = this.gpuOfferId;
    }

    this.instanceResize.addBtqt = 0;
    this.instanceResize.addBttn = 0;
    this.instanceResize.serviceInstanceId = this.instancesModel.id;
    this.instanceResize.regionId = this.region;
    this.instanceResize.serviceName = this.instancesModel.name;
    this.instanceResize.customerId = this.userId;
    this.instanceResize.projectId = this.projectId;
  }

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  order: Order = new Order();
  orderItem: OrderItem[] = [];
  isLoading: boolean = false;
  update() {
    this.isLoading = true;
    this.cdr.detectChanges();
    if (
      this.isGpuConfig == true &&
      (this.instanceResize.gpuCount == 0 || this.gpuOfferId == 0) &&
      (this.instancesModel.gpuCount == null ||
        this.instancesModel.gpuCount == 0)
    ) {
      this.notification.error(
        '',
        this.i18n.fanyi('app.notify.gpu.count.invalid')
      );
      return;
    }
    this.orderItem = [];
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

    this.orderService
      .validaterOrder(this.order)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.dataService.create(this.order).subscribe({
              next: (data: any) => {
                this.notification.success(
                  '',
                  this.i18n.fanyi('app.notify.update.instances.success')
                );
                // this.router.navigate(['/app-smart-cloud/instances']);
                this.commonService.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')
              },
              error: (e) => {
                this.notification.error(
                  e.statusText,
                  this.i18n.fanyi('app.notify.update.instances.fail')
                );
              },
            });
          } else {
            this.isVisiblePopupError = true;
            this.errorList = result.data;
          }
        },
        error: (error) => {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            error.error.message
          );
        },
      });
  }

  isChange: boolean = false;
  checkChangeConfig() {
    if (this.storage % this.stepCapacity > 0) {
      this.isChange = false;
    } else {
      if (
        this.isCustomconfig &&
        (this.storage != 0 || this.ram != 0 || this.vCPU != 0)
      ) {
        this.isChange = true;
      } else if (
        this.isGpuConfig &&
        this.isCurrentConfigGpu &&
        (this.storage != 0 ||
          this.ram != 0 ||
          this.vCPU != 0 ||
          this.instanceResize.gpuCount != this.instancesModel.gpuCount)
      ) {
        this.isChange = true;
      } else if (
        this.isGpuConfig &&
        !this.isCurrentConfigGpu &&
        this.instanceResize.gpuCount != this.instancesModel.gpuCount
      ) {
        this.isChange = true;
      } else {
        this.isChange = false;
      }
    }
  }

  minCapacity: number;
  maxCapacity: number = 0;
  stepCapacity: number = 0;
  getConfigurations() {
    this.configurationService.getConfigurations('BLOCKSTORAGE').subscribe({
      next: (data) => {
        let valueArray = data.valueString.split('#');
        this.minCapacity = Number.parseInt(valueArray[0]);
        this.stepCapacity = Number.parseInt(valueArray[1]);
        this.maxCapacity = Number.parseInt(valueArray[2]);
      },
    });
  }

  dataSubjectCapacity: Subject<any> = new Subject<any>();
  changeCapacity(value: number) {
    this.dataSubjectCapacity.next(value);
  }
  onChangeCapacity() {
    this.dataSubjectCapacity.pipe(debounceTime(700)).subscribe((res) => {
      if (this.storage % this.stepCapacity > 0) {
        this.notification.warning(
          '',
          this.i18n.fanyi('app.notify.amount.capacity', {
            number: this.stepCapacity,
          })
        );
        this.storage = this.storage - (this.storage % this.stepCapacity);
      }
      this.checkChangeConfig();
      this.cdr.detectChanges();
    });
  }

  onRegionChange(region: RegionModel) {
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    // this.router.navigate(['/app-smart-cloud/instances']);
    this.commonService.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')

  }

  onProjectChange(project: ProjectModel) {
    // this.router.navigate(['/app-smart-cloud/instances']);
    this.commonService.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')

  }

  cancel() {
    // this.router.navigate(['/app-smart-cloud/instances']);
    this.commonService.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')

  }

  navigateToCreate() {
    // this.router.navigate(['/app-smart-cloud/instances/instances-create-vpc']);
    this.commonService.navigateAdvance('/app-smart-cloud/instances/instances-create-vpc', '/app-smart-cloud/instances-advance/instances-create-vpc')

  }

  navigateToChangeImage() {
    // this.router.navigate([
    //   '/app-smart-cloud/instances/instances-edit-info/' + this.id,
    // ]);
    this.commonService.navigateAdvance('/app-smart-cloud/instances/instances-edit-info/' + this.id, '/app-smart-cloud/instances-advance/instances-edit-info/' + this.id)

  }

  returnPage(): void {
    // this.router.navigate(['/app-smart-cloud/instances']);
    this.commonService.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')

  }

  navigateToInstanceList(){
    this.commonService.navigateAdvance('/app-smart-cloud/instances', '/app-smart-cloud/instances-advance')
  }

  navigateToInstanceDetail(){
    this.commonService.navigateAdvance('/app-smart-cloud/instances/instances-detail/' + this.id, '/app-smart-cloud/instances-advance/instances-detail/' + this.id)
  }
}
