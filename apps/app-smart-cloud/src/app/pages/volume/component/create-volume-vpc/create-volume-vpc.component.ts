import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CreateVolumeRequestModel } from '../../../../shared/models/volume.model';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { InstancesModel, VolumeCreate } from '../../../instances/instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VolumeService } from '../../../../shared/services/volume.service';
import { SnapshotVolumeService } from '../../../../shared/services/snapshot-volume.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InstancesService } from '../../../instances/instances.service';
import { OrderItem } from '../../../../shared/models/price';
import { debounceTime, Subject } from 'rxjs';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { CatalogService } from '../../../../shared/services/catalog.service';
import {
  ProjectModel,
  RegionModel,
} from '../../../../../../../../libs/common-utils/src';
import { ProjectService } from 'src/app/shared/services/project.service';
import { SizeInCloudProject } from 'src/app/shared/models/project.model';
import { ConfigurationsService } from '../../../../shared/services/configurations.service';

@Component({
  selector: 'one-portal-create-volume-vpc',
  templateUrl: './create-volume-vpc.component.html',
  styleUrls: ['./create-volume-vpc.component.less']
})
export class CreateVolumeVpcComponent implements OnInit {
  // @Input() typeMultiAttach: boolean
  // @Input() typeEncrypt: boolean

  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false

  remaining: number

  isLoadingAction = false;

  volumeName = '';

  isInitSnapshot = false;
  snapshot: any;

  enableEncrypt: boolean = false;
  enableMultiAttach: boolean = false;


  validateForm: FormGroup<{
    name: FormControl<string>
    isSnapshot: FormControl<boolean>
    snapshot: FormControl<number>
    radio: FormControl<any>
    instanceId: FormControl<number>
    description: FormControl<string>
    storage: FormControl<number>
    radioAction: FormControl<any>
    isEncryption: FormControl<boolean>
    isMultiAttach: FormControl<boolean>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), this.duplicateNameValidator.bind(this)]],
    isSnapshot: [false, []],
    snapshot: [null as number, []],
    radio: [''],
    instanceId: [null as number],
    description: ['', Validators.maxLength(700)],
    storage: [0, [Validators.required, Validators.pattern(/^[0-9]*$/), this.checkQuota.bind(this)]],
    radioAction: [''],
    isEncryption: [false],
    isMultiAttach: [false]
  });

  snapshotSelected: number;

  multipleVolume: boolean = false;

  listInstances: InstancesModel[];

  instanceSelected: number;


  date: Date;

  iops: number = 300;

  nameList: string[] = [];

  orderItem: OrderItem = new OrderItem();
  unitPrice = 0;

  isVisibleCreate: boolean = false;
  isLoadingCreate: boolean = false;

  selectedValueHDD = true;
  selectedValueSSD = false;

  typeMultiple: boolean;
  typeEncrypt: boolean;

  snapshotList: NzSelectOptionInterface[] = [];

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private volumeService: VolumeService,
    private snapshotvlService: SnapshotVolumeService,
    private router: Router,
    private fb: NonNullableFormBuilder,
    private instanceService: InstancesService,
    private cdr: ChangeDetectorRef,
    private catalogService: CatalogService,
    private notification: NzNotificationService,
    private projectService: ProjectService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private configurationsService: ConfigurationsService
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

  checkQuota(control) {
    const value = control.value;
    if (this.remaining < value) {
      return { notEnough: true };
    } else {
      return null;
    }
  }

  dataSubjectStorage: Subject<any> = new Subject<any>();

  changeValueInput() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {
        if(res % 10 > 0) {
          this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity'))
          this.validateForm.controls.storage.setValue(res - (res % 10))
        }
      });
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/volumes']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;


    this.getListSnapshot();
    this.getListInstance();

    this.getCatalogOffer('MultiAttachment');
    this.getCatalogOffer('Encryption');

    this.getListVolumes();
  }

  userChangeProject(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/volumes']);
  }

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

  changeValueStorage(value) {
    this.dataSubjectStorage.next(value);
  }

  onChangeStatusSSD() {
    this.selectedValueSSD = true;
    this.selectedValueHDD = false;

    console.log('Selected option changed ssd:', this.selectedValueSSD);
    if (this.selectedValueSSD) {
      this.volumeCreate.volumeType = 'ssd';
      this.validateForm.controls.storage.reset();
      this.validateForm.controls.storage.markAsDirty()
      this.validateForm.controls.storage.updateValueAndValidity()
      this.remaining = this.sizeInCloudProject?.cloudProject?.quotaSSDInGb - this.sizeInCloudProject?.cloudProjectResourceUsed?.ssd;
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
      this.validateForm.controls.storage.reset();
      this.validateForm.controls.storage.markAsDirty()
      this.validateForm.controls.storage.updateValueAndValidity()

      this.remaining = this.sizeInCloudProject?.cloudProject?.quotaHddInGb - this.sizeInCloudProject?.cloudProjectResourceUsed?.hdd;
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

  sizeInCloudProject: SizeInCloudProject = new SizeInCloudProject();
  minStorage: number = 0;
  stepStorage: number = 0;
  valueString: string;

  getConfiguration() {
    this.configurationsService.getConfigurations('BLOCKSTORAGE').subscribe(data => {
      this.valueString = data.valueString;
      this.minStorage = Number.parseInt(this.valueString?.split('#')[0])
      this.stepStorage = Number.parseInt(this.valueString?.split('#')[1])
    })
  }
  ngOnInit() {
    this.getConfiguration();
    if (this.selectedValueHDD) {
      this.iops = 300;
    }
    if (this.selectedValueSSD) {
      if (this.validateForm.controls.storage.value <= 40) return (this.iops = 400);
      this.iops = this.validateForm.controls.storage.value * 10;
    }

    if (this.selectedValueHDD) {
      this.volumeCreate.volumeType = 'hdd';
    }
    if (this.selectedValueSSD) {
      this.volumeCreate.volumeType = 'ssd';
    }

    this.volumeCreate.volumeSize = this.validateForm.controls.storage.value;



    this.projectService.getByProjectId(this.project).subscribe(data => {
      this.isLoading = false;
      this.sizeInCloudProject = data;
      console.log(this.volumeCreate.volumeType)
      if(this.volumeCreate.volumeType === 'hdd') {
        this.remaining = this.sizeInCloudProject?.cloudProject?.quotaHddInGb - this.sizeInCloudProject?.cloudProjectResourceUsed?.hdd;
      }
      if(this.volumeCreate.volumeType === 'ssd') {
        this.remaining = this.sizeInCloudProject?.cloudProject?.quotaSSDInGb - this.sizeInCloudProject?.cloudProjectResourceUsed?.ssd;
      }


      this.validateForm.controls.storage.markAsDirty()
      this.validateForm.controls.storage.updateValueAndValidity()


    }, error => {
      this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
      this.isLoading = false;
    });

    this.getListInstance();
    this.changeValueInput();
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

  instanceSelectedChange(value: any) {
    this.instanceSelected = value;
  }

  showConfirmCreate() {
    this.isVisibleCreate = true;
  }

  handleCancelCreate() {
    this.isVisibleCreate = false;
    this.isLoadingCreate = false;
  }

  handleOkCreate() {
    this.doCreateVolumeVPC();
  }

  getListInstance() {
    this.instanceService.search(1, 9999, this.region, this.project,
      '', '', true, this.tokenService.get()?.userId)
      .subscribe(data => {
        this.listInstances = data.records;
        this.listInstances = data.records.filter(item => item.taskState === 'ACTIVE' && item.status === 'KHOITAO');
        this.cdr.detectChanges();
      });
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
    // this.volumeCreate.createDate = currentDate?.toISOString().substring(0, 19);
    // this.volumeCreate.expireDate = lastDate?.toISOString().substring(0, 19);

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

  doCreateVolumeVPC() {
    this.isLoadingCreate = true;
    if (this.validateForm.valid) {
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
          price: 0,
          serviceDuration: 1
        }
      ];
      console.log(request);
      this.volumeService.createNewVolume(request).subscribe(data => {
          if (data != null) {
            if (data.code == 200) {
              this.isLoadingAction = false;
              this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('volume.notification.require.create.success'));
              setTimeout(() => {
                this.router.navigate(['/app-smart-cloud/volumes']);
              }, 2500);
            }
          } else {
            this.isLoadingAction = false;
          }
        },
        error => {
          this.isLoadingAction = false;
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi(error.error.detail));
        });
    }
  }

}
