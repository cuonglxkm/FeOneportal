import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  BackupPackageRequestModel,
  PackageBackupModel
} from '../../../shared/models/package-backup.model';
import { OrderItem } from '../../../shared/models/price';
import { DataPayment, ItemPayment } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { getCurrentRegionAndProject } from '@shared';
import {
  FormUpdateSnapshotPackageModel,
  PackageSnapshotModel,
  SnapshotPackageRequestModel
} from 'src/app/shared/models/package-snapshot.model';
import { PackageSnapshotService } from 'src/app/shared/services/package-snapshot.service';
import { RegionID, ServiceActionType, ServiceType } from 'src/app/shared/enums/common.enum';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { ProjectService } from 'src/app/shared/services/project.service';
import { debounceTime, finalize, Subject } from 'rxjs';
import { ConfigurationsService } from '../../../shared/services/configurations.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { OrderService } from '../../../shared/services/order.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { I18NService } from '@core';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { SupportService } from 'src/app/shared/models/catalog.model';

@Component({
  selector: 'one-portal-resize-snapshot-package',
  templateUrl: './resize-snapshot-package.component.html',
  styleUrls: ['./resize-snapshot-package.component.less']
})
export class ResizeSnapshotPackageComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idSnapshotPackage: number;

  validateForm: FormGroup<{
    description: FormControl<string>
  }> = this.fb.group({
    description: ['', []]
  });

  isLoading: boolean = false;
  packageBackupModel: PackageBackupModel = new PackageBackupModel();
  packageSnapshotModel: PackageSnapshotModel = new PackageSnapshotModel();

  isVisibleEdit: boolean = false;
  isLoadingEdit: boolean = false;

  storage: number;
  packageName: string;

  resizeDate: Date;
  loadingCalculate = false;
  private searchSubjectHdd = new Subject<string>();
  private searchSubjectSsd = new Subject<string>();
  private readonly debounceTimeMs = 500;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  minBlock: number = 0;
  stepBlock: number = 0;
  maxBlock: number = 0;
  private inputChangeBlock = new Subject<{ value: number, name: string }>();
  serviceActiveByRegion: SupportService[] = [];
  typeSnapshotHdd:boolean;
  typeSnapshotSsd:boolean;

  typeVPC: number;
  numberHDD = 0;
  numberSSD = 0;
  numberHDDBonus = 0;
  numberSSDBonus = 0;
  totalAmount: number;
  totalPayment: number;
  totalVat: number;
  hddPrice = 0;
  hddUnitPrice = 0;
  ssdPrice = 0;
  ssdUnitPrice = 0;
  today = new Date();

  formUpdateSnapshotPackageModel: FormUpdateSnapshotPackageModel = new FormUpdateSnapshotPackageModel();
  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;
  titleBreadcrumb:string;
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private router: Router,
    private orderService: OrderService,
    private catalogService: CatalogService,
    private packageBackupService: PackageBackupService,
    private packageSnapshotService: PackageSnapshotService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    private instanceService: InstancesService,
    private route: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder,
    private configurationsService: ConfigurationsService,
    private projectService: ProjectService) {
    this.inputChangeBlock.pipe(
      debounceTime(800)
    ).subscribe(data => this.checkNumberBlock(data.value, data.name));

  }

  // call api get step block 
  getStepBlock(name: string) {
    this.configurationsService.getConfigurations(name).subscribe((res: any) => {
      const valuestring: any = res.valueString;
      const parts = valuestring.split("#")
      this.minBlock = parseInt(parts[0]);
      this.stepBlock = parseInt(parts[1]);
      this.maxBlock = parseInt(parts[2]);
      this.numberHDDBonus = this.minBlock;
      this.numberSSDBonus = this.minBlock;
      this.getTotalAmount();
    })
  }
  onInputChange(value: number, name: string): void {
    this.inputChangeBlock.next({ value, name });

  }
  // function check number input block
  checkNumberBlock(value: number, name: string): void {
    const messageStepNotification = `Số lượng phải chia hết cho  ${this.stepBlock} `;
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      this.notification.warning('', messageStepNotification);
      return;
    }
    let adjustedValue = Math.floor(numericValue / this.stepBlock) * this.stepBlock;
    if (adjustedValue > this.maxBlock) {
      adjustedValue = Math.floor(this.maxBlock / this.stepBlock) * this.stepBlock;
    } else if (adjustedValue < this.minBlock) {
      this.notification.warning('', messageStepNotification);
      adjustedValue = this.minBlock;

    }
    if (numericValue !== adjustedValue) {
      this.notification.warning('', messageStepNotification);
    }
    switch (name) {
      case "hhd":
        this.numberHDDBonus = adjustedValue;
        break;
      case "ssd":
        this.numberSSDBonus = adjustedValue;
        break;

    }
    if (numericValue !== adjustedValue) {
      this[name] = adjustedValue;
    }
    this.getTotalAmount();

  }

  navigateToSnapshotPackage() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages']);
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages']);
    }
  }
  navigateToDetail() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages/detail/' + this.idSnapshotPackage])
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages/detail/' + this.idSnapshotPackage])
    }
    
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.projectService.getByRegion(this.region).subscribe(data => {
      if (data.length) {
        localStorage.setItem('projectId', data[0].id.toString());
        this.navigateToSnapshotPackage()
      }
    });
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  getDetailPackageSnapshot(id) {
    this.loadingCalculate = true;
    this.packageSnapshotService.detail(id, this.project)
      .pipe(finalize(() => {
        this.loadingCalculate = false;
      }))
      .subscribe(data => {
        console.log('data', data);
        this.packageSnapshotModel = data;
        this.storage = this.packageSnapshotModel.sizeInGB;
        this.validateForm.controls['description'].setValue(data.description);
        this.numberHDD = data.totalSizeHDD;
        this.numberSSD = data.totalSizeSSD;
        this.packageName = data.packageName;
        console.log("hhhhoooo", data)
        this.getTotalAmount();
      }, error => {
        if (error.status === 500) {
          this.router.navigate(['/app-smart-cloud/snapshot/packages']);
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi(error.error.detail));
        }

      });
  }

  changeValueInput() {

  }

  showModalEdit() {
    this.isVisibleEdit = true;
  }

  handleOk() {
    this.isVisibleEdit = false;
  }

  handleCancel() {
    this.isVisibleEdit = false;
  }

  reset() {
    this.validateForm.reset();
  }

 

  getTotalAmount() {
    this.loadingCalculate = true;
    let data = {
      sizeSsdInGB: this.numberSSD + this.numberSSDBonus,
      sizeHddInGB: this.numberHDD + this.numberHDDBonus,
      newOfferId: 0,
      serviceType: 22,
      actionType: 4,
      serviceInstanceId: this.idSnapshotPackage,
      regionId: this.region,
      serviceName: this.packageName,
      projectId: this.project,
      typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.SnapshotPackageResizeSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null',
      userEmail: null,
      actorEmail: null
    };
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(data);
    itemPayment.specificationType = 'snapshotpackage_resize';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment)
      .pipe(finalize(() => {
        this.loadingCalculate = false;
      }))
      .subscribe((result) => {
        console.log('thanh tien snapshot package', result.data);
        this.orderItem = result.data;
        this.unitPrice = this.orderItem?.orderItemPrices[0].unitPrice.amount;

        this.totalAmount = Math.round(result?.data?.totalAmount?.amount);
        this.totalPayment = Math.round(result?.data?.totalPayment?.amount);
        this.totalVat = Math.round(result?.data?.totalVAT?.amount);

        this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
        const detailArray = this.ssdPrice = this.orderItem?.orderItemPrices[0]?.details;
        if (detailArray != null && detailArray.length > 0) {
          for (let item of detailArray) {
            if (item.typeName == 'volume-snapshot-hdd') {
              this.hddPrice = item.totalAmount.amount;
              this.hddUnitPrice = item.unitPrice.amount;
            } else if (item.typeName == 'volume-snapshot-ssd') {
              this.ssdPrice = item.totalAmount.amount;
              this.ssdUnitPrice = item.unitPrice.amount;
            }
          }
        }
      });

  }


  navigateToPaymentSummary() {
    this.getTotalAmount();
    let data = {
      sizeSsdInGB: this.numberSSD + this.numberSSDBonus,
      sizeHddInGB: this.numberHDD + this.numberHDDBonus,
      newOfferId: 0,
      serviceType: 22,
      actionType: 4,
      serviceInstanceId: this.idSnapshotPackage,
      regionId: this.region,
      serviceName: this.packageName,
      projectId: this.project,
      typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.SnapshotPackageResizeSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null',
      userEmail: null,
      actorEmail: null
    };
    let request: SnapshotPackageRequestModel = new SnapshotPackageRequestModel();
    request.customerId = this.formUpdateSnapshotPackageModel.customerId;
    request.createdByUserId = this.formUpdateSnapshotPackageModel.customerId;
    request.note = 'resize snapshot package';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(data),
        specificationType: 'snapshotpackage_resize',
        price:this.orderItem?.totalAmount?.amount,
        serviceDuration: 0
      }
    ];
    this.orderService.validaterOrder(request).subscribe(
      data => {
        if (data.success) {
          if (this.region === RegionID.ADVANCE) {
            var returnPath: string = `/app-smart-cloud/snapshot-advance/packages/edit/${this.idSnapshotPackage}`;
          } else {
            var returnPath: string = `/app-smart-cloud/snapshot/packages/edit/${this.idSnapshotPackage}`;
          }

          console.log('request', request);
          this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
        } else {
          this.isVisiblePopupError = true;
          this.errorList = data.data;
        }
      },
      error => {

      }
    );

  }

 

  loadProjects() {
    this.projectService.getByRegion(this.region).subscribe(data => {
      let project = data.find(project => project.id === +this.project);
      if (project) {
        this.typeVPC = project.type;
      }
    });
  }
  url = window.location.pathname;
  ngOnInit() {
    this.validateForm.controls['description'].disable();
    this.idSnapshotPackage = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
       this.titleBreadcrumb ='Dịch vụ hạ tầng'
    } else {
      this.region = RegionID.ADVANCE;
       this.titleBreadcrumb ='Dịch vụ nâng cao'
    }
    // this.customerId = this.tokenService.get()?.userId
    if (this.project && this.region) {
      this.loadProjects();
    }
    if (this.idSnapshotPackage) {
      this.getDetailPackageSnapshot(this.idSnapshotPackage);

      this.resizeDate = new Date();
    }
    this.getStepBlock('BLOCKSTORAGE');
    this.getProductActivebyregion();
  }

  checkPossiblePress($event: KeyboardEvent) {
    const key = $event.key;
    if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight' && key != 'Tab') {
      $event.preventDefault();
    }
  }
  // check các dịch vụ theo region
  getProductActivebyregion() {
    const catalogs = ['ip', 'ipv6', 'volume-snapshot-hdd', 'volume-snapshot-ssd', 'backup-volume', 'loadbalancer-sdn', 'file-storage', 'file-storage-snapshot', 'vpns2s', 'vm-gpu']
    this.catalogService.getActiveServiceByRegion(catalogs, this.region).subscribe(data => {
      this.serviceActiveByRegion = data;
      this.serviceActiveByRegion.forEach((item: any) => {
        if (['volume-snapshot-hdd'].includes(item.productName)) {
          this.typeSnapshotHdd = item.isActive;
        }
        if (['volume-snapshot-ssd'].includes(item.productName)) {
          this.typeSnapshotSsd = item.isActive;
        }
      });
    });
  }


}
