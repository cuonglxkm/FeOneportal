import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { PackageBackupModel } from '../../../shared/models/package-backup.model';
import {
  FormUpdateSnapshotPackageModel,
  PackageSnapshotModel,
  SnapshotPackageRequestModel
} from '../../../shared/models/package-snapshot.model';
import { debounceTime, finalize, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { PackageSnapshotService } from '../../../shared/services/package-snapshot.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InstancesService } from '../../instances/instances.service';
import { ProjectService } from '../../../shared/services/project.service';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { OrderItem } from '../../../shared/models/price';
import { DataPayment, ItemPayment } from '../../instances/instances.model';
import { getCurrentRegionAndProject } from '@shared';

@Component({
  selector: 'one-portal-extend-package-snapshot',
  templateUrl: './extend-package-snapshot.component.html',
  styleUrls: ['./extend-package-snapshot.component.less'],
})
export class ExtendPackageSnapshotComponent implements OnInit{
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
  packageSnapshotModel: PackageSnapshotModel = undefined;


  loadingCalculate = false;
  numOfMonth: any = 1;

  constructor(private router: Router,
              private packageSnapshotService: PackageSnapshotService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private instanceService: InstancesService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private projectService: ProjectService) {
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

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  getDetailPackageSnapshot(id) {
    this.loadingCalculate = true;
    this.packageSnapshotService.detail(id, this.project)
      .pipe(finalize(() => {
        this.loadingCalculate = false
      }))
      .subscribe(data => {
      console.log('data', data);
      this.packageSnapshotModel = data;
      this.validateForm.controls['description'].setValue(data.description);
      this.getTotalAmount();
    });
  }

  reset() {
    this.validateForm.reset();
  }

  formUpdateSnapshotPackageModel: FormUpdateSnapshotPackageModel = new FormUpdateSnapshotPackageModel();
  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  getTotalAmount() {
    if (this.numOfMonth != 0) {
      this.loadingCalculate = true;
      let newExpDate = new Date(this.packageSnapshotModel.expirationDate)
      newExpDate.setDate(newExpDate.getDate() + this.numOfMonth*30)
      let data = {
        newExpireDate: newExpDate,
        serviceType: 22,
        actionType: 3,
        serviceInstanceId: this.idSnapshotPackage,
        regionId: this.region,
        serviceName: null,
        projectId: this.project,
        typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.SnapshotPackageExtendSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null',
        userEmail: null,
        actorEmail: null
      };
      let itemPayment: ItemPayment = new ItemPayment();
      itemPayment.orderItemQuantity = 1;
      itemPayment.specificationString = JSON.stringify(data);
      itemPayment.specificationType = 'snapshotpackage_extend';
      itemPayment.serviceDuration = this.numOfMonth;
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
    let newExpDate = new Date(this.packageSnapshotModel.expirationDate)
    newExpDate.setDate(newExpDate.getDate() + this.numOfMonth*30)
    let data = {
      newExpireDate: newExpDate,
      serviceType: 22,
      actionType: 3,
      serviceInstanceId: this.idSnapshotPackage,
      regionId: this.region,
      serviceName: null,
      projectId: this.project,
      typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.SnapshotPackageExtendSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null',
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
        specificationType: 'snapshotpackage_extend',
        price: this.totalAmount,
        serviceDuration: this.numOfMonth
      }
    ];
    var returnPath: string = `/app-smart-cloud/snapshot/packages/extend/${this.idSnapshotPackage}`;
    console.log('request', request);
    this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
  }

  totalAmount: number;
  totalPayment: number;
  totalVat: number;
  hddPrice = 0;
  ssdPrice = 0;

  loadProjects() {
    this.projectService.getByRegion(this.region).subscribe(data => {
      let project = data.find(project => project.id === +this.project);
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
    this.getDetailPackageSnapshot(this.route.snapshot.paramMap.get('id'));
  }

  checkPossiblePress($event: KeyboardEvent) {
    const key = $event.key;
    if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
      $event.preventDefault();
    }
  }

  onChangeTime($event: any) {
    this.numOfMonth = $event;
    this.getTotalAmount();
  }
}
