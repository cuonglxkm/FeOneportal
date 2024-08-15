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

  resizeDate: Date;
  loadingCalculate = false;
  private searchSubjectHdd = new Subject<string>();
  private searchSubjectSsd = new Subject<string>();
  private readonly debounceTimeMs = 500;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  closePopupError() {
    this.isVisiblePopupError = false;
  }
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private router: Router,
              private orderService: OrderService,
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
    this.searchSubjectHdd.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      if ((this.numberHDDBonus % this.stepStorage) > 0) {
        this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity', { number: this.stepStorage }));
        this.numberHDDBonus = this.numberHDDBonus - (this.numberHDDBonus % this.stepStorage);
      }
      this.getTotalAmount();
    });
    this.searchSubjectSsd.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      if ((this.numberSSDBonus % this.stepStorage) > 0) {
        this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity', { number: this.stepStorage }));
        this.numberSSDBonus = this.numberSSDBonus - (this.numberSSDBonus % this.stepStorage);
      }
      this.getTotalAmount();
    });
  }

  minStorage: number = 0;
  stepStorage: number = 0;
  valueString: string;
  maxStorage: number = 0;

  getConfiguration() {
    this.configurationsService.getConfigurations('BLOCKSTORAGE').subscribe(data => {
      this.valueString = data.valueString;
      this.minStorage = Number.parseInt(this.valueString?.split('#')[0]);
      this.stepStorage = Number.parseInt(this.valueString?.split('#')[1]);
      this.maxStorage = Number.parseInt(this.valueString?.split('#')[2]);
    });
  }

  navigateToSnapshotPackage(){
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages']);
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages']);
    }
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
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
      this.getTotalAmount();
    },error =>{      
      if(error.status===500){
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

  formUpdateSnapshotPackageModel: FormUpdateSnapshotPackageModel = new FormUpdateSnapshotPackageModel();
  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  getTotalAmount() {
    if (this.numberSSDBonus + this.numberHDDBonus != 0) {
      this.loadingCalculate = true;
      let data = {
        sizeSsdInGB: this.numberSSD + this.numberSSDBonus,
        sizeHddInGB: this.numberHDD + this.numberHDDBonus,
        newOfferId: 0,
        serviceType: 22,
        actionType: 4,
        serviceInstanceId: this.idSnapshotPackage,
        regionId: this.region,
        serviceName: null,
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
      serviceName: null,
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
          price: 0,
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

  typeVPC: number;
  numberHDD = 0;
  numberSSD = 0;
  numberHDDBonus = 0;
  numberSSDBonus = 0;
  totalAmount: number;
  totalPayment: number;
  totalVat: number;
  hddPrice = 0;
  hddUnitPrice=0;
  ssdPrice = 0;
  ssdUnitPrice=0;
  today = new Date();

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
    this.getConfiguration();
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
    } else {
      this.region = RegionID.ADVANCE;
    }
    // this.customerId = this.tokenService.get()?.userId
    if (this.project && this.region) {
      this.loadProjects();
    }
    if (this.idSnapshotPackage) {
      this.getDetailPackageSnapshot(this.idSnapshotPackage);

      this.resizeDate = new Date();
    }
  }

  checkPossiblePress($event: KeyboardEvent) {
    const key = $event.key;
    if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
      $event.preventDefault();
    }
  }

  changeQuota(isHdd: boolean) {
    if (isHdd) {
      this.searchSubjectHdd.next('');
    } else {
      this.searchSubjectSsd.next('');
    }
  }
}
