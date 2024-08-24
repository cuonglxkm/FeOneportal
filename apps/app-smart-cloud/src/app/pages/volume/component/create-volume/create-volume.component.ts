import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CreateVolumeRequestModel } from '../../../../shared/models/volume.model';
import { VolumeService } from '../../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { SnapshotVolumeService } from '../../../../shared/services/snapshot-volume.service';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { InstancesService } from '../../../instances/instances.service';
import { DataPayment, InstancesModel, ItemPayment, VolumeCreate } from '../../../instances/instances.model';
import { OrderItem } from 'src/app/shared/models/price';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { getCurrentRegionAndProject } from '@shared';
import { debounceTime, Subject } from 'rxjs';
import { ProjectModel, RegionModel, storageValidator } from '../../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ConfigurationsService } from '../../../../shared/services/configurations.service';
import { OrderService } from '../../../../shared/services/order.service';
import { SupportService } from '../../../../shared/models/catalog.model';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'app-create-volume',
  templateUrl: './create-volume.component.html',
  styleUrls: ['./create-volume.component.less']
})
export class CreateVolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoadingAction = false;

  volumeName = '';
  snapshotList = [];
  isInitSnapshot = false;
  snapshot: any;

  selectedValueHDD = true;
  selectedValueSSD = false;

  validateForm: FormGroup<{
    name: FormControl<string>;
    isSnapshot: FormControl<boolean>;
    snapshot: FormControl<number>;
    radio: FormControl<any>;
    instanceId: FormControl<number>;
    time: FormControl<number>;
    description: FormControl<string>;
    storage: FormControl<number>;
    checkMulti: FormControl<any>;
    checkEncrypt: FormControl<any>;
    isEncryption: FormControl<boolean>;
    isMultiAttach: FormControl<boolean>;
  }> = this.fb.group({
    name: [
      null as string, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), this.duplicateNameValidator.bind(this)]
    ],
    isSnapshot: [false, []],
    snapshot: [null as number, []],
    radio: [''],
    instanceId: [null as number],
    time: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    description: ['', Validators.maxLength(700)],
    storage: [0, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    checkMulti: [''],
    checkEncrypt: [''],
    isEncryption: [false],
    isMultiAttach: [false]
  });

  snapshotSelected: number;

  multipleVolume: boolean = false;

  listInstances: InstancesModel[];

  instanceSelected: number;

  timeSelected: any;

  date: Date;

  iops: number = 300;

  nameList: string[] = [];

  typeVPC: number;

  typeMultiple: boolean;
  typeEncrypt: boolean;
  typeSnapshot: boolean;

  dataSubjectStorage: Subject<any> = new Subject<any>();

  enableEncrypt: boolean = false;
  enableMultiAttach: boolean = false;

  offerId: number;

  isStorageZero = false;

  isVolumeHdd: boolean;
  isVolumeSsd: boolean

  // snapshot: any;

  serviceActiveByRegion: SupportService[] = [];
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private volumeService: VolumeService,
    private snapshotvlService: SnapshotVolumeService,
    private router: Router,
    private fb: NonNullableFormBuilder,
    private instanceService: InstancesService,
    private cdr: ChangeDetectorRef,
    private catalogService: CatalogService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private notification: NzNotificationService,
    private configurationsService: ConfigurationsService,
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute
  ) {
    this.validateForm.get('isMultiAttach').valueChanges.subscribe((value) => {
      this.multipleVolume = value;
      this.validateForm.get('instanceId').reset();
      this.enableMultiAttach = value;
    });

    this.validateForm.get('isEncryption').valueChanges.subscribe((value) => {
      this.enableEncrypt = value;
    });

    //hdd => iops = 300, ssd => dung lương <= 40 -> iops = 400; dung lượng > 40 -> iops = dung lượng * 10
    this.validateForm.get('storage').valueChanges.subscribe((value) => {
      if (this.volumeCreate.volumeType == 'hdd') return (this.iops = 300);
      if (this.volumeCreate.volumeType == 'ssd') {
        if (value <= 40) return (this.iops = 400);
        this.iops = value * 10;
      }
    });

    this.validateForm.controls.storage.valueChanges.subscribe(value => {
      this.isStorageZero = value === 0;
    });
  }

  //check trùng tên trong list
  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  isLoading: boolean = false;

  // check các dịch vụ được sử dụng theo khu vực
  getActiveServiceByRegion() {
    this.isLoading = true;
    this.catalogService.getActiveServiceByRegion(
      ['volume-ssd', 'volume-hdd', 'MultiAttachment', 'Encryption', 'volume-snapshot-ssd', 'volume-snapshot-hdd', 'volume-hdd', 'volume-ssd'], this.region)
      .subscribe(data => {
        this.isLoading = false;
        this.serviceActiveByRegion = data;
        this.serviceActiveByRegion.forEach(item => {
          if (['volume-snapshot-hdd', 'volume-snapshot-ssd'].includes(item.productName)) {
            this.typeSnapshot = item.isActive;
          }
          if (['MultiAttachment'].includes(item.productName)) {
            this.typeMultiple = item.isActive;
          }
          if (['Encryption'].includes(item.productName)) {
            this.typeEncrypt = item.isActive;
          }
          if(['volume-hdd'].includes(item.productName)){
            this.isVolumeHdd = item.isActive
          }
          if(['volume-ssd'].includes(item.productName)){
            this.isVolumeSsd = item.isActive
          }
        });
      }, error => {
        this.isLoading = false;
        this.typeEncrypt = false;
        this.typeMultiple = false;
        this.typeSnapshot = false;
        this.serviceActiveByRegion = [];
      });
  }

  getListVolumes() {
    this.volumeService.getVolumes(this.tokenService.get()?.userId, this.project, this.region, 9999, 1, null, null)
      .subscribe((data) => {
          data.records.forEach((item) => {
            if (this.nameList.length > 0) {
              this.nameList.push(item.name);
            } else {
              this.nameList = [item.name];
            }
          });
        },
        (error) => {
          this.nameList = null;
        }
      );
  }

  isFirstMounting: boolean = false;
  minStorage: number = 0;
  stepStorage: number = 0;
  valueString: string;
  maxStorage: number = 0;

  //lấy thông số mua theo block
  getConfiguration() {
    this.configurationsService.getConfigurations('BLOCKSTORAGE').subscribe(data => {
      this.valueString = data.valueString;
      this.minStorage = Number.parseInt(this.valueString?.split('#')[0]);
      this.stepStorage = Number.parseInt(this.valueString?.split('#')[1]);
      this.maxStorage = Number.parseInt(this.valueString?.split('#')[2]);
      // this.validateForm.controls.storage.setValue(this.minStorage)
    });
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.navigateToVolume()
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;
    this.typeVPC = project.type;


    // this.getListSnapshot();
    this.getListInstance();

    this.getActiveServiceByRegion();

    // this.getCatalogOffer('MultiAttachment');
    // this.getCatalogOffer('Encryption');

    this.getListVolumes();
  }

  userChangeProject(project: ProjectModel) {
    this.navigateToVolume()
  }

  // tắt bật tạo từ snapshot
  onSwitchSnapshot(value) {
    this.isInitSnapshot = value;
    console.log('snap shot', this.isInitSnapshot);
    if (this.isInitSnapshot) {
      this.validateForm.controls.snapshot.setValidators(Validators.required);
      this.disableSSD = true
      this.disableHDD = true
    } else {
      this.disableSSD = false
      this.disableHDD = false

      this.validateForm.controls.snapshot.clearValidators();
      this.validateForm.controls.snapshot.updateValueAndValidity();

      this.validateForm.controls.storage.clearValidators();
      this.validateForm.controls.storage.updateValueAndValidity();
    }

  }

  snapshotSelectedChange(value: number) {
    this.snapshotSelected = value;
    console.log('snapshot selected: ', this.snapshotSelected);
    if (this.snapshotSelected != undefined) {
      this.getDetailSnapshotVolume(this.snapshotSelected);
    }
  }


  onChangeStatusSSD() {
    this.selectedValueSSD = true;
    this.selectedValueHDD = false;

    console.log('Selected option changed ssd:', this.selectedValueSSD);
    if (this.selectedValueSSD) {
      this.volumeCreate.volumeType = 'ssd';
      this.validateForm.controls.storage.reset();
      this.validateForm.controls.storage.markAsDirty();
      this.validateForm.controls.storage.updateValueAndValidity();
      if (this.validateForm.get('storage').value <= 40) {
        this.iops = 400;
      } else {
        this.iops = this.validateForm.get('storage').value * 10;
      }
    }

  }

  onChangeStatusHDD() {
    this.selectedValueHDD = true;
    this.selectedValueSSD = false;
    console.log('Selected option changed hdd:', this.selectedValueHDD);
    // this.iops = this.validateForm.get('storage').value * 10
    this.validateForm.controls.storage.reset();
    this.validateForm.controls.storage.markAsDirty();
    this.validateForm.controls.storage.updateValueAndValidity();
    if (this.selectedValueHDD) {
      this.volumeCreate.volumeType = 'hdd';
      this.iops = 300;
    }
  }

  onChangeStatusEncrypt(value) {
    console.log('value change encrypt', value);
    if (value == true) {
      this.validateForm.controls.isEncryption.setValue(true);
      this.validateForm.controls.isMultiAttach.setValue(false);
    }
  }

  onChangeStatusMultiAttach(value) {
    if (value == true) {
      this.validateForm.controls.isMultiAttach.setValue(true);
      this.validateForm.controls.isEncryption.setValue(false);
    }
  }

  //get danh sách máy ảo
  getListInstance() {
    this.instanceService
      .search(1, 9999, this.region, this.project, '', 'KHOITAO', true, this.tokenService.get()?.userId)
      .subscribe((data) => {
        this.listInstances = data.records;
        this.listInstances = data.records.filter(item => item.taskState === 'ACTIVE' && item.status === 'KHOITAO');
        // console.log('list instance', this.listInstances);
        this.cdr.detectChanges();
      });
  }

  instanceSelectedChange(value: any) {
    this.instanceSelected = value;
  }

  timeSelectedChange(value) {
    this.timeSelected = value;
    this.validateForm.controls.time.setValue(this.timeSelected);
    console.log(this.timeSelected);
    this.getTotalAmount();
  }

  goBack(): void {
    this.navigateToVolume()
  }

  volumeCreate: VolumeCreate = new VolumeCreate();

  volumeInit() {
    if (this.selectedValueHDD) {
      this.volumeCreate.volumeType = 'hdd';
    }
    if (this.selectedValueSSD) {
      this.volumeCreate.volumeType = 'ssd';
    }
    console.log('volumeType', this.volumeCreate.volumeType);
    this.volumeCreate.volumeSize = this.validateForm.get('storage').value;
    this.volumeCreate.description = this.validateForm.get('description').value?.trimStart().trimEnd();
    this.volumeCreate.iops = this.iops;
    if (this.validateForm.controls.isSnapshot.value == true) {
      this.volumeCreate.createFromSnapshotId =
        this.validateForm.controls.snapshot.value;
    } else {
      this.volumeCreate.createFromSnapshotId = null;
    }

    this.volumeCreate.instanceToAttachId =
      this.validateForm.controls.instanceId.value;
    this.volumeCreate.isMultiAttach =
      this.validateForm.controls.isMultiAttach.value;
    this.volumeCreate.isEncryption =
      this.validateForm.controls.isEncryption.value;
    this.volumeCreate.projectId = this.project.toString();
    this.volumeCreate.oneSMEAddonId = null;
    this.volumeCreate.serviceType = 2;
    this.volumeCreate.serviceInstanceId = 0;
    this.volumeCreate.customerId = this.tokenService.get()?.userId;
    let currentDate = new Date();
    let lastDate = new Date();
    if (this.timeSelected == undefined || this.timeSelected == null) {
      lastDate.setDate(currentDate.getDate() + 30);
    } else {
      lastDate.setDate(currentDate.getDate() + this.timeSelected * 30);
    }
    this.volumeCreate.createDate = currentDate?.toISOString().substring(0, 19);
    this.volumeCreate.expireDate = lastDate?.toISOString().substring(0, 19);

    this.volumeCreate.saleDept = null;
    this.volumeCreate.saleDeptCode = null;
    this.volumeCreate.contactPersonEmail = null;
    this.volumeCreate.contactPersonPhone = null;
    this.volumeCreate.contactPersonName = null;
    this.volumeCreate.note = null;
    this.volumeCreate.createDateInContract = null;
    this.volumeCreate.am = null;
    this.volumeCreate.amManager = null;
    this.volumeCreate.isTrial = false;
    // this.volumeCreate.offerId =
    //     this.volumeCreate.volumeType == 'hdd' ? 2 : 156;
    this.volumeCreate.couponCode = null;
    this.volumeCreate.dhsxkd_SubscriptionId = null;
    this.volumeCreate.dSubscriptionNumber = null;
    this.volumeCreate.dSubscriptionType = null;
    this.volumeCreate.oneSME_SubscriptionId = null;
    this.volumeCreate.actionType = 0;
    this.volumeCreate.regionId = this.region;
    this.volumeCreate.serviceName = this.validateForm.get('name').value?.trimStart().trimEnd();
    this.volumeCreate.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null';
    this.volumeCreate.userEmail = this.tokenService.get()?.email;
    this.volumeCreate.actorEmail = this.tokenService.get()?.email;
  }

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;


  changeValueStorage(value) {
    this.dataSubjectStorage.next(value);
  }

  onChangeValueStorage() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {

        if ((res % this.stepStorage) > 0) {
          this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity', { number: this.stepStorage }));
          this.validateForm.controls.storage.setValue(res - (res % this.stepStorage));
        }
        this.getTotalAmount();
      });
  }

  isVisiblePopupError: boolean = false;
  errorList: string[] = [];

  closePopupError() {
    this.isVisiblePopupError = false;
  }

  navigateToVolume(){
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/volumes-advance']);
      }else{
        this.router.navigate(['/app-smart-cloud/volumes']);
      }
  }

  navigateToPaymentSummary() {
    // this.getTotalAmount()
    this.volumeInit();
    console.log('value', this.volumeCreate);
    let request: CreateVolumeRequestModel = new CreateVolumeRequestModel();
    request.customerId = this.volumeCreate.customerId;
    request.createdByUserId = this.volumeCreate.customerId;
    request.note = this.i18n.fanyi('volume.notification.request.create');
    request.totalPayment = this.orderItem?.totalPayment?.amount;
    request.totalVAT = this.orderItem?.totalVAT?.amount;
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.volumeCreate),
        specificationType: 'volume_create',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ];
    this.orderService.validaterOrder(request).subscribe(data => {
      if (data.success) {
        if(this.hasRoleSI) {
          this.volumeService.createNewVolume(request).subscribe(data => {
              this.isLoadingAction = false;
              if (data != null) {
                if (data.code == 200) {
                  this.isLoadingAction = false;
                  this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('volume.notification.require.create.success'));
                  this.navigateToVolume()
                }
              } else {
                this.isLoadingAction = false;
              }
            },
            error => {
              this.isLoadingAction = false;
              this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('volume.notification.request.create.fail'));
            });
        } else {
          if (this.region === RegionID.ADVANCE) {
            var returnPath: string = '/app-smart-cloud/volume-advance/create';
            }else{
              var returnPath: string = '/app-smart-cloud/volume/create';
            }

          console.log('request', request);
          console.log('service name', this.volumeCreate.serviceName);
          this.router.navigate(['/app-smart-cloud/order/cart'], {
            state: { data: request, path: returnPath }
          });
        }
      } else {
        this.isVisiblePopupError = true;
        this.errorList = data.data;
      }
    }, error => {
      this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message);
    });
  }

  getTotalAmount() {
    this.isLoadingAction = true;
    this.volumeInit();
    // console.log('time', this.timeSelected);
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.volumeCreate);
    itemPayment.specificationType = 'volume_create';
    itemPayment.serviceDuration = this.validateForm.get('time').value;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.instanceService.getTotalAmount(dataPayment)
      .pipe(debounceTime(500))
      .subscribe((result) => {
        this.isLoadingAction = false;
        // console.log('thanh tien volume', result.data);
        this.orderItem = result.data;
        this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
      });
  }

  getListSnapshot() {
    this.isLoadingAction = true;
    // this.snapshotList = [];
    this.snapshotvlService.getSnapshotVolumes(9999, 1, this.region, this.project, '', '', '').subscribe(data => {
      this.isLoadingAction = false;
      console.log('data vl snapshot', data.records);
      data?.records.forEach(item => {
        if ((['AVAILABLE', 'KHOITAO'].includes(item.resourceStatus) || ['AVAILABLE', 'KHOITAO'].includes(item.serviceStatus)) && !item.fromRootVolume) {
          this.snapshotList?.push(item);
        }
      });
      if (this.activatedRoute.snapshot.paramMap.get('idSnapshot')) {
        // console.log('here',this.activatedRoute.snapshot.paramMap.get('idSnapshot'))
        const idSnapshot = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('idSnapshot'));
        console.log('list snapshot', this.snapshotList?.find(x => x.id == idSnapshot));
        if (this.snapshotList?.find(x => x.id == idSnapshot)) {
          // console.log('here 1:')
          this.onSwitchSnapshot(true);
          this.snapshotSelected = idSnapshot;
          this.validateForm.controls.snapshot.setValue(this.snapshotSelected);
          this.getDetailSnapshotVolume(idSnapshot);
        }
      }
    });
  }

  getDetailVolume(idVolume) {
    this.volumeService.getVolumeById(idVolume, this.project).subscribe(data => {
      this.onChangeStatusEncrypt(data.isEncryption);
      this.onChangeStatusMultiAttach(data.isMultiAttach);
      console.log('instance', data?.attachedInstances[0]?.instanceId);
      this.instanceSelectedChange(data?.attachedInstances[0]?.instanceId);
      // this.validateForm.controls.instanceId.setValue(data?.attachedInstances[0]?.instanceId);
    });
  }

  disableHDD: boolean
  disableSSD: boolean
  getDetailSnapshotVolume(id) {
    this.snapshotvlService.getSnapshotVolumeById(id).subscribe(data => {
      this.snapshot = data;
      console.log('data', data);
      this.validateForm.controls.storage.setValue(data.sizeInGB);
      this.validateForm.controls.storage.setValidators([storageValidator(data.sizeInGB)]);
      this.validateForm.controls.storage.updateValueAndValidity();
      // this.minStorage = data.sizeInGB
      this.getDetailVolume(data.volumeId);
      if (data.volumeType == 'hdd') {
        this.selectedValueHDD = true;
        this.selectedValueSSD = false;
        this.disableHDD = true
      }
      if (data.volumeType == 'ssd') {
        this.selectedValueSSD = true;
        this.selectedValueHDD = false;
        this.disableSSD = true
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    console.log('event', event)
    console.log('event 2', event)
    if (event.key === 'Enter' &&
      (this.isLoadingAction
        || this.validateForm.invalid
        || this.validateForm.controls.storage.value == 0
        || this.validateForm.controls.time.value == 0
        || this.validateForm.controls.storage.value % this.stepStorage > 0 || this.isStorageZero)) {
      event.preventDefault(); // Prevent default action if conditions are met
    }
  }

  hasRoleSI: boolean;
  url = window.location.pathname;
  ngOnInit() {
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
    this.getListSnapshot();
    this.getConfiguration();
    this.onChangeValueStorage();
    this.getTotalAmount();
    this.hasRoleSI = localStorage.getItem('role').includes('SI');

  }

  //

}
