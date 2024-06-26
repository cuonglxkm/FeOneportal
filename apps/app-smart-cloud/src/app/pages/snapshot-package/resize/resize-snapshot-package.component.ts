import { Component, Inject, OnInit } from '@angular/core';
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
import { ServiceActionType, ServiceType } from 'src/app/shared/enums/common.enum';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { ProjectService } from 'src/app/shared/services/project.service';
import { debounceTime, finalize, Subject } from 'rxjs';

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
  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 500;

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              private packageSnapshotService: PackageSnapshotService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private instanceService: InstancesService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private projectService: ProjectService) {
    // this.validateForm.get('storage').valueChanges.subscribe(data => {
    //   this.getTotalAmount()
    // })

    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.getTotalAmount();
    });
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.projectService.getByRegion(this.region).subscribe(data => {
      if (data.length) {
        localStorage.setItem('projectId', data[0].id.toString());
        this.router.navigate(['/app-smart-cloud/snapshot/packages']);
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
                this.hddPrice = item.unitPrice.amount;
              } else if (item.typeName == 'volume-snapshot-ssd') {
                this.ssdPrice = item.unitPrice.amount;
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
      var returnPath: string = `/app-smart-cloud/snapshot/packages/edit/${this.idSnapshotPackage}`;
      console.log('request', request);
      this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
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
  ssdPrice = 0;

  loadProjects() {
    this.projectService.getByRegion(this.region).subscribe(data => {
      let project = data.find(project => project.id === +this.project);
      if (project) {
        this.typeVPC = project.type;
      }
    });
  }

  ngOnInit() {
    this.validateForm.controls['description'].disable();
    this.idSnapshotPackage = Number.parseInt(this.route.snapshot.paramMap.get('id'));
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
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

  changeQuota() {
    this.searchSubject.next('');
  }
}
