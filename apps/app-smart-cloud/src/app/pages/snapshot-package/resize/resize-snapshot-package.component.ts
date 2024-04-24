import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {
  BackupPackageRequestModel,
  PackageBackupModel
} from "../../../shared/models/package-backup.model";
import {OrderItem} from "../../../shared/models/price";
import {DataPayment, ItemPayment} from "../../instances/instances.model";
import {InstancesService} from "../../instances/instances.service";
import {getCurrentRegionAndProject} from "@shared";
import { FormUpdateSnapshotPackageModel, PackageSnapshotModel, SnapshotPackageRequestModel } from 'src/app/shared/models/package-snapshot.model';
import { PackageSnapshotService } from 'src/app/shared/services/package-snapshot.service';
import { ServiceActionType, ServiceType } from 'src/app/shared/enums/common.enum';
import { ProjectService, RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-resize-snapshot-package',
  templateUrl: './resize-snapshot-package.component.html',
  styleUrls: ['./resize-snapshot-package.component.less'],
})
export class ResizeSnapshotPackageComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idSnapshotPackage: number

  validateForm: FormGroup<{
    storage: FormControl<number>
  }> = this.fb.group({
    storage: [1, [Validators.required]]
  })

  isLoading: boolean = false
  packageBackupModel: PackageBackupModel = new PackageBackupModel()
  packageSnapshotModel: PackageSnapshotModel = new PackageSnapshotModel()

  isVisibleEdit: boolean = false
  isLoadingEdit: boolean = false

  storage: number

  resizeDate: Date;

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              private packageSnapshotService: PackageSnapshotService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private instanceService: InstancesService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder,
              private projectService: ProjectService) {
    this.validateForm.get('storage').valueChanges.subscribe(data => {
      this.getTotalAmount()
    })
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.projectService.getByRegion(this.region).subscribe(data => {
      if (data.length) {
        localStorage.setItem("projectId", data[0].id.toString())
        this.router.navigate(['/app-smart-cloud/snapshot/packages'])
      }
    });
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  getDetailPackageSnapshot(id) {
    this.packageSnapshotService.detail(id).subscribe(data => {
      console.log('data', data)
      this.packageSnapshotModel = data
      this.storage = this.packageSnapshotModel.sizeInGB
      this.validateForm.controls.storage.setValue(this.packageSnapshotModel.sizeInGB)
      this.getTotalAmount()
    })
  }

  changeValueInput() {

  }

  showModalEdit() {
    this.isVisibleEdit = true
  }

  handleOk(){
    this.isVisibleEdit =  false
  }

  handleCancel() {
    this.isVisibleEdit = false
  }

  reset() {
    this.validateForm.reset()
  }

  formUpdateSnapshotPackageModel: FormUpdateSnapshotPackageModel = new FormUpdateSnapshotPackageModel()
  snapshotPackageInit() {
    this.formUpdateSnapshotPackageModel.packageName = this.packageSnapshotModel.packageName
    this.formUpdateSnapshotPackageModel.size = this.validateForm.get('storage').value
    this.formUpdateSnapshotPackageModel.description = this.packageSnapshotModel.description
    this.formUpdateSnapshotPackageModel.vpcId = this.project.toString()
    this.formUpdateSnapshotPackageModel.serviceType = ServiceType.SNAPSHOT_PACKET
    this.formUpdateSnapshotPackageModel.serviceInstanceId = this.idSnapshotPackage;
    this.formUpdateSnapshotPackageModel.customerId = this.tokenService.get()?.userId;
    this.formUpdateSnapshotPackageModel.newOfferId = 0;

    this.formUpdateSnapshotPackageModel.actionType = ServiceActionType.RESIZE;
    this.formUpdateSnapshotPackageModel.regionId = this.region;
    this.formUpdateSnapshotPackageModel.serviceName = this.packageSnapshotModel.packageName
    this.formUpdateSnapshotPackageModel.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.SnapshotPackageResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
    this.formUpdateSnapshotPackageModel.userEmail = this.tokenService.get()?.email;
    this.formUpdateSnapshotPackageModel.actorEmail = this.tokenService.get()?.email;
  }

  totalAmountVolume = 0;
  totalAmountVolumeVAT = 0;
  orderItem: OrderItem = new OrderItem()
  unitPrice = 0

  getTotalAmount() {
    this.snapshotPackageInit()
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formUpdateSnapshotPackageModel);
    itemPayment.specificationType = 'snapshotpacket_resize';
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien snapshot package', result.data);
      this.orderItem = result.data
      this.unitPrice = this.orderItem?.orderItemPrices[0].unitPrice.amount
    });
  }


  navigateToPaymentSummary() {
    this.getTotalAmount()
    if (this.validateForm.valid) {
      let request: SnapshotPackageRequestModel = new SnapshotPackageRequestModel()
      request.customerId = this.formUpdateSnapshotPackageModel.customerId;
      request.createdByUserId = this.formUpdateSnapshotPackageModel.customerId;
      request.note = 'resize snapshot package';
      request.orderItems = [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(this.formUpdateSnapshotPackageModel),
          specificationType: 'snapshotpackage_resize',
          price: 0,
          serviceDuration: 0  
        }
      ]
      var returnPath: string = `/app-smart-cloud/snapshot/packages/edit/${this.idSnapshotPackage}`
      console.log('request', request)
      this.router.navigate(['/app-smart-cloud/order/cart'], {state: {data: request, path: returnPath}});
    } else {
      this.notification.warning('', 'Vui lòng nhập đầy đủ thông tin')
    }
  }

  typeVPC: number

  loadProjects() {
    this.projectService.getByRegion(this.region).subscribe(data => {
      let project = data.find(project => project.id === +this.project);
      if (project) {
        this.typeVPC = project.type
      }
    });
  }

  ngOnInit() {
    this.idSnapshotPackage = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    // this.customerId = this.tokenService.get()?.userId
    if (this.project && this.region) {
      this.loadProjects()
    }
    if(this.idSnapshotPackage) {
      this.getDetailPackageSnapshot(this.idSnapshotPackage)

      this.resizeDate = new Date()
    }
  }
}
