import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, Subject } from 'rxjs';
import {
  ServiceActionType,
  ServiceType,
} from 'src/app/shared/enums/common.enum';
import { FileSystemDetail } from 'src/app/shared/models/file-system.model';
import {
  ExtendFileSystemSnapshotRequestModel,
  OrderExtendFileSystemSnapshot,
} from 'src/app/shared/models/filesystem-snapshot';
import { OrderItem } from 'src/app/shared/models/price';
import { ConfigurationsService } from 'src/app/shared/services/configurations.service';
import { FileSystemService } from 'src/app/shared/services/file-system.service';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { ProjectService } from 'src/app/shared/services/project.service';
import {
  ProjectModel,
  RegionModel,
} from '../../../../../../../libs/common-utils/src';
import { DataPayment, ItemPayment } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-extend-file-system-snapshot',
  templateUrl: './extend-file-system-snapshot.component.html',
  styleUrls: ['./extend-file-system-snapshot.component.less'],
})
export class ExtendFileSystemSnapshotComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idFileSystem: number;

  storage: number;
  fileSystemSnapshotId: number;
  fileSystemId: number;

  isLoading: boolean = false;

  fileSystemSnapshotDetail: any;

  fileSystem: FileSystemDetail = new FileSystemDetail();

  isInitSnapshot: boolean = false;

  snapshot: any;
  valueStringConfiguration: string;
  minStorage: number;
  maxStorage: number;
  stepStorage: number;

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;
  dataSubjectTime: Subject<any> = new Subject<any>();

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  closePopupError() {
    this.isVisiblePopupError = false;
  }

  validateForm: FormGroup<{
    snapshot: FormControl<boolean>;
    time: FormControl<number>;
  }> = this.fb.group({
    snapshot: [false],
    time: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
  });
  timeSelected: any;

  estimateExpireDate: Date = null;

  formExtend: OrderExtendFileSystemSnapshot =
    new OrderExtendFileSystemSnapshot();

  constructor(
    private fb: NonNullableFormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fileSystemService: FileSystemService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private instanceService: InstancesService,
    private fileSystemSnapshotService: FileSystemSnapshotService,
    private configurationsService: ConfigurationsService,
    private notification: NzNotificationService,
    private orderService: OrderService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  regionChanged(region: RegionModel) {
    // this.region = region.regionId
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/file-system-snapshot']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/file-system-snapshot']);
  }

  changeTime(value) {
    this.dataSubjectTime.next(value);
  }

  getFileSystemById(id) {
    this.fileSystemService
      .getFileSystemById(id, this.region, this.project)
      .subscribe(
        (data) => {
          this.fileSystem = data;
        },
        (error) => {
          this.fileSystem = null;
        }
      );
  }

  onChangeTime(value) {
    // this.dataSubjectTime.pipe(debounceTime(500))
    //   .subscribe((res) => {
    this.timeSelected = value;
    this.validateForm.controls.time.setValue(this.timeSelected);
    this.getTotalAmount();
    // })
  }
  getFileSystemSnapshotById(id) {
    this.isLoading = true;
    this.fileSystemSnapshotService
      .getFileSystemSnapshotById(id, this.project)
      .subscribe(
        (data) => {
          if (data) {
            this.fileSystemSnapshotDetail = data;
            this.fileSystemId = data.shareId;
            this.getFileSystemById(data.shareId);
            const oldDate = new Date(this.fileSystemSnapshotDetail?.expireDate);
            this.estimateExpireDate = oldDate;
            const exp = this.estimateExpireDate.setDate(oldDate.getDate() + 30);
            this.estimateExpireDate = new Date(exp);
            this.getTotalAmount();
          } else {
            this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.file.storage.not.exist'));
            this.router.navigate([
              '/app-smart-cloud/file-system-snapshot',
            ]);
          }
          this.isLoading = false;
        },
        (error) => {
          this.fileSystemSnapshotDetail = null;
          this.isLoading = false;
        }
      );
  }

  fileSystemSnapshotInit() {
    this.formExtend.serviceInstanceId = this.fileSystemSnapshotId;
    this.formExtend.projectId = this.project;
    this.formExtend.vpcId = this.project;
    this.formExtend.customerId = this.tokenService.get()?.userId;
    this.formExtend.userEmail = this.tokenService.get()?.email;
    this.formExtend.actorEmail = this.tokenService.get()?.email;
    this.formExtend.regionId = this.region;
    this.formExtend.serviceName = this.fileSystemSnapshotDetail?.name;
    this.formExtend.serviceType = ServiceType.SHARE_SNAPSHOT;
    this.formExtend.actionType = ServiceActionType.EXTEND;
    this.formExtend.newExpireDate = this.estimateExpireDate;
    this.formExtend.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.GenericExtendSpecificaton,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
  }

  getTotalAmount() {
    this.fileSystemSnapshotInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.formExtend);
    itemPayment.specificationType = 'sharesnapshot_extend';
    itemPayment.sortItem = 0;
    itemPayment.serviceDuration = this.validateForm.controls.time.value;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;

    this.instanceService.getTotalAmount(dataPayment).subscribe((result) => {
      console.log('thanh tien extend', result.data);
      this.orderItem = result.data;
      this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
    });
  }

  navigateToPaymentSummary() {
    this.fileSystemSnapshotInit();
    this.getTotalAmount();
    let request = new ExtendFileSystemSnapshotRequestModel();
    request.customerId = this.formExtend.customerId;
    request.createdByUserId = this.formExtend.customerId;
    request.note = 'Gia hạn File System Snapshot';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.formExtend),
        specificationType: 'sharesnapshot_extend',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: this.validateForm.controls.time.value,
      },
    ];
    this.orderService.validaterOrder(request).subscribe(
      (data) => {
        if (data.success) {
          console.log('request', request);
          var returnPath: string =
            '/app-smart-cloud/file-system-snapshot/extend/' +
            this.fileSystemSnapshotId;
          console.log('request', request);
          this.router.navigate(['/app-smart-cloud/order/cart'], {
            state: { data: request, path: returnPath },
          });
        } else {
          this.isVisiblePopupError = true;
          this.errorList = data.data;
        }
      },
      (error) => {
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          error.error.detail
        );
      }
    );
  }

  getConfigurations() {
    this.configurationsService
      .getConfigurations('BLOCKSTORAGE')
      .subscribe((data) => {
        this.valueStringConfiguration = data.valueString;
        const arr = this.valueStringConfiguration.split('#');
        this.minStorage = Number.parseInt(arr[0]);
        this.stepStorage = Number.parseInt(arr[1]);
      });
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.fileSystemSnapshotId = Number.parseInt(
      this.activatedRoute.snapshot.paramMap.get('id')
    );
    this.getFileSystemSnapshotById(this.fileSystemSnapshotId);
    this.getConfigurations();
  }
}
