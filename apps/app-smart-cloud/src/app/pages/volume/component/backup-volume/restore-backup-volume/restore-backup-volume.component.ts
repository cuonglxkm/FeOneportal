import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../../../../libs/common-utils/src';
import { ActivatedRoute, Router } from '@angular/router';
import { BackupVolumeService } from '../../../../../shared/services/backup-volume.service';
import { ProjectService } from '../../../../../shared/services/project.service';
import { PackageBackupService } from '../../../../../shared/services/package-backup.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { getCurrentRegionAndProject } from '@shared';
import { SizeInCloudProject } from '../../../../../shared/models/project.model';
import {
  BackupVolume,
  FormOrderRestoreBackupVolume,
  FormRestoreCurrentBackupVolume,
  FormRestoreNewBackupVolume
} from '../backup-volume.model';
import { PackageBackupModel } from '../../../../../shared/models/package-backup.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VolumeDTO } from '../../../../../shared/dto/volume.dto';
import { debounceTime, Subject } from 'rxjs';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ConfigurationsService } from '../../../../../shared/services/configurations.service';
import { DataPayment, InstancesModel, ItemPayment } from '../../../../instances/instances.model';
import { InstancesService } from '../../../../instances/instances.service';
import { OrderItem } from '../../../../../shared/models/price';
import { OrderService } from '../../../../../shared/services/order.service';
import { CatalogService } from '../../../../../shared/services/catalog.service';

@Component({
  selector: 'one-portal-restore-backup-volume',
  templateUrl: './restore-backup-volume.component.html',
  styleUrls: ['./restore-backup-volume.component.less']
})
export class RestoreBackupVolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;

  idBackupVolume: number;

  projectDetail: SizeInCloudProject;

  backupVolume: BackupVolume;
  backupPackageDetail: PackageBackupModel = new PackageBackupModel();

  typeVpc: number;

  selectedOption: string = 'current';

  validateForm = new FormGroup({
    formCurrent: new FormGroup({
      volumeId: new FormControl(null as number)
    }),
    formNew: new FormGroup({
      volumeName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), this.duplicateNameValidator.bind(this)]
      }),
      storage: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[0-9]*$/)]
      }),
      instanceId: new FormControl(null as number),
      time: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required]
      })
    })
  });

  listVolumes: VolumeDTO[] = [];

  volumeSelected: any;

  volumeDetail: VolumeDTO;

  nameList: string[] = [];

  minStorage: number = 0;
  stepStorage: number = 0;
  valueString: string;
  maxStorage: number = 0;
  instanceSelected: number;
  listInstances: InstancesModel[];
  isLoadingAction = false;
  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  volumeRestoreNew: FormRestoreNewBackupVolume = new FormRestoreNewBackupVolume();

  dataSubjectStorage: Subject<any> = new Subject<any>();

  offerId: number = 0;

  constructor(private router: Router,
              private backupVolumeService: BackupVolumeService,
              private activatedRoute: ActivatedRoute,
              private projectService: ProjectService,
              private backupPackageService: PackageBackupService,
              private notification: NzNotificationService,
              private volumeService: VolumeService,
              private cdr: ChangeDetectorRef,
              private configurationsService: ConfigurationsService,
              private instanceService: InstancesService,
              private orderService: OrderService,
              private catalogService: CatalogService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  getConfiguration() {
    this.configurationsService.getConfigurations('BLOCKSTORAGE').subscribe(data => {
      this.valueString = data.valueString;
      this.minStorage = Number.parseInt(this.valueString?.split('#')[0]);
      this.stepStorage = Number.parseInt(this.valueString?.split('#')[1]);
      this.maxStorage = Number.parseInt(this.valueString?.split('#')[2]);
    });
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/backup-volume']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type;
    // this.getListVolume(true);
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-volume']);
  }

  changeValueStorage(value) {
    this.dataSubjectStorage.next(value);
  }

  onChangeValueStorage() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {
        if ((res % this.stepStorage) > 0) {
          this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity', { number: this.stepStorage }));
          this.validateForm.get('formNew').get('storage').setValue(res - (res % this.stepStorage));
        }
        console.log('total amount');
        this.getTotalAmount();
      });
  }

  onSelectionChange(): void {
    console.log('Selected option:', this.selectedOption);
    if (this.selectedOption === 'current') {
      this.validateForm.get('formNew').reset();
      this.validateForm.get('formNew').get('volumeName').clearValidators();
      this.validateForm.get('formNew').get('volumeName').updateValueAndValidity();
    } else if (this.selectedOption === 'new') {
      this.validateForm.get('formNew').get('storage').setValue(this.backupVolume?.size);
      this.validateForm.get('formNew').get('volumeName').setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), this.duplicateNameValidator.bind(this)]);
      this.validateForm.get('formNew').get('storage').setValidators([Validators.required, Validators.pattern(/^[0-9]*$/)]);
      // this.validateForm.get
    }
    this.cdr.detectChanges();
  }

  getDetailBackupVolume(id) {
    this.isLoading = true;
    this.backupVolumeService.detail(id).subscribe(data => {
      this.backupVolume = data;
      if (this.backupVolume?.typeName.includes('hdd')) {
        this.catalogService.getCatalogOffer(2, this.region, null, null).subscribe(data => {
          this.offerId = data[0].productId;
        });
      }
      if (this.backupVolume?.typeName.includes('ssd')) {
        this.catalogService.getCatalogOffer(114, this.region, null, null).subscribe(data => {
          this.offerId = data[0].productId;
        });
      }
      console.log('offerId', this.offerId);
      this.isLoading = false;
      if (this.backupVolume?.backupPackageId != null) {
        this.backupPackageService.detail(this.backupVolume?.backupPackageId, this.project).subscribe(data => {
          this.backupPackageDetail = data;
        });
      }
    }, error => {
      this.isLoading = false;
      this.router.navigate(['/app-smart-cloud/backup-volume']);
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('volume.notification.access.denied'));
    });
  }

  getInfoProjectVpc(id) {
    this.projectService.getProjectVpc(id).subscribe(data => {
      this.projectDetail = data;
    });
  }

  getListVolumes() {
    this.isLoading = true;
    this.volumeService.getVolumes(this.tokenService.get()?.userId, this.project,
      this.region, 9999, 1, null, null)
      .pipe(debounceTime(500))
      .subscribe(data => {
        this.isLoading = false;
        data.records.forEach(item => {
          this.nameList?.push(item.name);
          if (item.sizeInGB >= this.backupVolume?.size
            && this.backupVolume?.volumeType === item.volumeType
            && this.backupVolume?.isEncryption === item.isEncryption) {
            this.listVolumes?.push(item);
          }
        });
        this.validateForm.get('formCurrent').get('volumeId').setValue(this.listVolumes[0]?.id);
      }, error => {
        this.isLoading = false;
        this.listVolumes = [];
        console.log(error);
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'));
      });
  }

  getVolumeDetail(id) {
    this.volumeService.getVolumeById(id, this.project).subscribe(data => {
      this.volumeDetail = data;
    });
  }

  volumeSelectedChange(value) {
    console.log('volume selected', value);
    this.volumeSelected = value;
    if (this.volumeSelected != undefined) {
      this.getVolumeDetail(this.volumeSelected);
    }
  }

  instanceSelectedChange(value: any) {
    this.instanceSelected = value;
  }

  //get danh sách máy ảo
  getListInstance() {
    this.instanceService
      .search(1, 9999, this.region, this.project, '', 'KHOITAO', true, this.tokenService.get()?.userId)
      .subscribe((data) => {
        this.listInstances = data.records;
        this.listInstances = data.records.filter(item => item.taskState === 'ACTIVE' && item.status === 'KHOITAO');
        console.log('list instance', this.listInstances);
        this.cdr.detectChanges();
      });
  }

  timeSelected: any;

  onChangeTime(value) {
    this.timeSelected = value;
    this.validateForm.get('formNew').get('time').setValue(this.timeSelected);
    console.log(this.timeSelected);
    this.getTotalAmount();
  }

  //restore current
  restoreCurrent() {
    this.isLoadingAction = true;
    let formRestoreCurrent = new FormRestoreCurrentBackupVolume();
    formRestoreCurrent.volumeBackupId = this.idBackupVolume;
    formRestoreCurrent.volumeId = this.validateForm.get('formCurrent').get('volumeId').value;
    this.backupVolumeService.restoreBackupVolumeCurrent(formRestoreCurrent).subscribe(data => {
      this.isLoadingAction = false;
      this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.backup.volume.notification.restore.success'));
      this.router.navigate(['/app-smart-cloud/backup-volume']);
    }, error => {
      this.isLoadingAction = false;
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.backup.volume.notification.restore.fail', { error: error.error.detail }));
      this.router.navigate(['/app-smart-cloud/backup-volume']);
    });
  }

  //restore new
  volumeInit() {
    this.volumeRestoreNew.volumeBackupId = this.idBackupVolume;
    this.volumeRestoreNew.volumeName = this.validateForm.get('formNew').get('volumeName').value;
    this.volumeRestoreNew.volumeSize = this.validateForm.get('formNew').get('storage').value;
    this.volumeRestoreNew.instanceToAttachId = this.volumeDetail?.attachedInstances[0]?.instanceId;
    this.volumeRestoreNew.customerId = this.tokenService.get()?.userId;
    this.volumeRestoreNew.userEmail = this.tokenService.get()?.email;
    this.volumeRestoreNew.actorEmail = this.tokenService.get()?.email;
    this.volumeRestoreNew.projectId = this.project;
    this.volumeRestoreNew.vpcId = this.project;
    this.volumeRestoreNew.regionId = this.region;
    this.volumeRestoreNew.serviceName = this.validateForm.get('formNew').get('volumeName').value;
    this.volumeRestoreNew.serviceType = 2;
    this.volumeRestoreNew.actionType = 0;
    this.volumeRestoreNew.serviceInstanceId = 0;
    this.volumeRestoreNew.createDateInContract = null;
    this.volumeRestoreNew.saleDept = null;
    this.volumeRestoreNew.saleDeptCode = null;
    this.volumeRestoreNew.contactPersonEmail = null;
    this.volumeRestoreNew.contactPersonPhone = null;
    this.volumeRestoreNew.contactPersonName = null;
    this.volumeRestoreNew.am = null;
    this.volumeRestoreNew.amManager = null;
    this.volumeRestoreNew.note = 'restore backup volume';
    this.volumeRestoreNew.isTrial = false;
    this.volumeRestoreNew.offerId = this.offerId;
    this.volumeRestoreNew.couponCode = null;
    this.volumeRestoreNew.dhsxkd_SubscriptionId = null;
    this.volumeRestoreNew.dSubscriptionNumber = null;
    this.volumeRestoreNew.dSubscriptionType = null;
    this.volumeRestoreNew.oneSMEAddonId = null;
    this.volumeRestoreNew.oneSME_SubscriptionId = null;
    this.volumeRestoreNew.isSendMail = true;
    this.volumeRestoreNew.typeName = 'SharedKernel.IntegrationEvents.Orders.Specifications.BackupVolumeRestoreSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null';
  }

  getTotalAmount() {
    this.isLoadingAction = true;
    this.volumeInit();
    console.log('time', this.timeSelected);
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.volumeRestoreNew);
    itemPayment.specificationType = 'restore_volumebackup';
    itemPayment.serviceDuration = this.validateForm.get('formNew').get('time').value;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment)
      .pipe(debounceTime(500))
      .subscribe((result) => {
        this.isLoadingAction = false;
        console.log('thanh tien volume', result.data);
        this.orderItem = result.data;
        this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
      });
  }

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];

  closePopupError() {
    this.isVisiblePopupError = false;
  }

  navigateToPaymentSummary() {
    this.isLoadingAction = true;
    this.volumeInit();
    console.log('value', this.volumeRestoreNew);
    let request: FormOrderRestoreBackupVolume = new FormOrderRestoreBackupVolume();
    request.customerId = this.volumeRestoreNew.customerId;
    request.createdByUserId = this.volumeRestoreNew.customerId;
    request.note = this.i18n.fanyi('app.backup.volume.note.restore.new');
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.volumeRestoreNew),
        specificationType: 'restore_volumebackup',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: this.validateForm.get('formNew').get('time').value
      }
    ];
    this.orderService.validaterOrder(request).subscribe(data => {
      this.isLoadingAction = false;
      if (data.success) {

        var returnPath: string = '/app-smart-cloud/backup-volume/restore/' + this.idBackupVolume;
        console.log('request', request);
        console.log('service name', this.volumeRestoreNew.serviceName);
        this.router.navigate(['/app-smart-cloud/order/cart'], {
          state: { data: request, path: returnPath }
        });
      } else {
        this.isVisiblePopupError = true;
        this.errorList = data.data;
      }
    }, error => {
      this.isLoadingAction = false;
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail);
    });
  }


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.idBackupVolume = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));

    this.getDetailBackupVolume(this.idBackupVolume);

    this.getInfoProjectVpc(this.project);
    this.getListVolumes();
    this.getConfiguration();
    this.onChangeValueStorage();
    this.getListInstance();
    this.getTotalAmount();

    // console.log('valid current',this.validateForm.get('formCurrent').get('volumeId').valid)

  }
}
