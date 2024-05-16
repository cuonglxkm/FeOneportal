import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { CreateVolumeRequestModel } from '../../../../shared/models/volume.model';
import { VolumeService } from '../../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Router } from '@angular/router';
import { SnapshotVolumeService } from '../../../../shared/services/snapshot-volume.service';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { InstancesService } from '../../../instances/instances.service';
import { DataPayment, InstancesModel, ItemPayment, VolumeCreate } from '../../../instances/instances.model';
import { OrderItem } from 'src/app/shared/models/price';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { getCurrentRegionAndProject } from '@shared';
import { debounceTime, Subject } from 'rxjs';
import { ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

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
  snapshotList: NzSelectOptionInterface[] = [];
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
    storage: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
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

  dataSubjectStorage: Subject<any> = new Subject<any>();

  enableEncrypt: boolean = false;
  enableMultiAttach: boolean = false;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private volumeService: VolumeService,
    private snapshotvlService: SnapshotVolumeService,
    private router: Router,
    private fb: NonNullableFormBuilder,
    private instanceService: InstancesService,
    private cdr: ChangeDetectorRef,
    private catalogService: CatalogService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {
    this.validateForm.get('isMultiAttach').valueChanges.subscribe((value) => {
      this.multipleVolume = value;
      this.validateForm.get('instanceId').reset();
      this.enableMultiAttach = value;
    });

    this.validateForm.get('isEncryption').valueChanges.subscribe((value) => {
      this.enableEncrypt = value;
    });

    this.validateForm.get('storage').valueChanges.subscribe((value) => {
      if (this.volumeCreate.volumeType == 'hdd') return (this.iops = 300);
      if (this.volumeCreate.volumeType == 'ssd') {
        if (value <= 40) return (this.iops = 400);
        this.iops = value * 10;
      }
    });
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

  getCatalogOffer(type) {
    this.catalogService
      .getCatalogOffer(null, this.region, null, type)
      .subscribe((data) => {
        console.log('data catalog', data);
        if (data[0]?.regions[0]?.regionId == this.region) {
          if (type == 'MultiAttachment') {
            this.typeMultiple = true;
          }
          if (type == 'Encryption') {
            this.typeEncrypt = true;
          }
        } else {
          this.typeMultiple = false;
          this.typeEncrypt = false;
        }
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

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/volumes']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;
    this.typeVPC = project.type;


    this.getListSnapshot();
    this.getListInstance();

    this.getCatalogOffer('MultiAttachment');
    this.getCatalogOffer('Encryption');

    this.getListVolumes();
  }

  userChangeProject(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/volumes']);
  }

  onSwitchSnapshot() {
    this.isInitSnapshot = this.validateForm.controls.isSnapshot.value;
    console.log('snap shot', this.isInitSnapshot);
    if (this.isInitSnapshot) {
      this.validateForm.controls.snapshot.setValidators(Validators.required);
    } else {
      this.validateForm.controls.snapshot.clearValidators();
      this.validateForm.controls.snapshot.updateValueAndValidity();
    }

  }

  snapshotSelectedChange(value: number) {
    this.snapshotSelected = value;
  }

  onChangeStatusSSD() {
    this.selectedValueSSD = true;
    this.selectedValueHDD = false;

    console.log('Selected option changed ssd:', this.selectedValueSSD);
    if (this.selectedValueSSD) {
      this.volumeCreate.volumeType = 'ssd';
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
    if (this.selectedValueHDD) {
      this.volumeCreate.volumeType = 'hdd';
      this.iops = 300;
    }
  }

  onChangeStatusEncrypt(value) {
    console.log('value change encrypt', value);
    if(value == true) {
      this.validateForm.controls.isEncryption.setValue(true)
      this.validateForm.controls.isMultiAttach.setValue(false)
    }
  }

  onChangeStatusMultiAttach(value) {
    if(value == true) {
      this.validateForm.controls.isMultiAttach.setValue(true)
      this.validateForm.controls.isEncryption.setValue(false)
    }
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

  instanceSelectedChange(value: any) {
    this.instanceSelected = value;
  }

  timeSelectedChange(value) {
    this.timeSelected = value;
    console.log(this.timeSelected);
    this.getTotalAmount();
  }

  goBack(): void {
    this.router.navigate(['/app-smart-cloud/volumes']);
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
    this.volumeCreate.description = this.validateForm.get('description').value;
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
    this.volumeCreate.serviceName = this.validateForm.get('name').value;
    this.volumeCreate.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null';
    this.volumeCreate.userEmail = this.tokenService.get()?.email;
    this.volumeCreate.actorEmail = this.tokenService.get()?.email;
  }

  totalAmountVolume = 0;
  totalAmountVolumeVAT = 0;
  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;


  changeValueInput() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {
        console.log('total amount');
        this.getTotalAmount();
      });
  }

  changeValueStorage(value) {
    this.dataSubjectStorage.next(value);
  }

  navigateToPaymentSummary() {
    // this.getTotalAmount()
    this.volumeInit();
    let request: CreateVolumeRequestModel = new CreateVolumeRequestModel();
    request.customerId = this.volumeCreate.customerId;
    request.createdByUserId = this.volumeCreate.customerId;
    request.note = this.i18n.fanyi('volume.notification.request.create');
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(this.volumeCreate),
        specificationType: 'volume_create',
        price: this.orderItem?.totalAmount.amount,
        serviceDuration: this.validateForm.controls.time.value
      }
    ];
    var returnPath: string = '/app-smart-cloud/volume/create';
    console.log('request', request);
    console.log('service name', this.volumeCreate.serviceName);
    this.router.navigate(['/app-smart-cloud/order/cart'], {
      state: { data: request, path: returnPath }
    });
  }

  getTotalAmount() {
    this.volumeInit();

    console.log('time', this.timeSelected);
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
        console.log('thanh tien volume', result.data);
        this.orderItem = result.data;
        this.unitPrice = this.orderItem?.orderItemPrices[0]?.unitPrice.amount;
      });
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    // this.customerId = this.tokenService.get()?.userId

    this.changeValueInput();

    this.getListSnapshot();
    this.getListInstance();


    this.getListVolumes();

    this.date = new Date();
    this.getTotalAmount();


    // this.getCatalogOffer('MultiAttachment')
    // this.getCatalogOffer('Encryption')
  }

  //
  private getListSnapshot() {
    this.isLoadingAction = true;
    this.snapshotList = [];
    let userId = this.tokenService.get()?.userId;
    this.snapshotvlService
      .getSnapshotVolumes(
        9999,
        1,
        this.region,
        this.project,
        '',
        '',
        ''
      )
      .subscribe((data) => {
        data.records.forEach((snapshot) => {
          this.snapshotList.push({ label: snapshot.name, value: snapshot.id });
        });
        this.isLoadingAction = false;
      });
  }
}
