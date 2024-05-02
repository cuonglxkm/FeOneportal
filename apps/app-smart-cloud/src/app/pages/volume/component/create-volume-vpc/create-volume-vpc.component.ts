import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CreateVolumeRequestModel, GetAllVmModel } from '../../../../shared/models/volume.model';
import { CreateVolumeDto, VmDto } from '../../../../shared/dto/volume.dto';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { InstancesModel, VolumeCreate } from '../../../instances/instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VolumeService } from '../../../../shared/services/volume.service';
import { SnapshotVolumeService } from '../../../../shared/services/snapshot-volume.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InstancesService } from '../../../instances/instances.service';
import { OrderItem } from '../../../../shared/models/price';
import { debounceTime, Subject } from 'rxjs';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-create-volume-vpc',
  templateUrl: './create-volume-vpc.component.html',
  styleUrls: ['./create-volume-vpc.component.less']
})
export class CreateVolumeVpcComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoadingAction = false;

  volumeName = '';

  isInitSnapshot = false;
  snapshot: any;

  selectedValueRadio = 'hdd';

  validateForm: FormGroup<{
    name: FormControl<string>
    isSnapshot: FormControl<boolean>
    snapshot: FormControl<number>
    radio: FormControl<any>
    instanceId: FormControl<number>
    description: FormControl<string>
    storage: FormControl<number>
    isEncryption: FormControl<boolean>
    isMultiAttach: FormControl<boolean>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), this.duplicateNameValidator.bind(this)]],
    isSnapshot: [false, []],
    snapshot: [null as number, []],
    radio: [''],
    instanceId: [null as number],
    description: ['', Validators.maxLength(700)],
    storage: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]],
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
  selectedValueSSD = false

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private volumeService: VolumeService,
              private notification: NzNotificationService,
              private router: Router,
              private fb: NonNullableFormBuilder,
              private instanceService: InstancesService,
              private cdr: ChangeDetectorRef,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    this.validateForm.get('isMultiAttach').valueChanges.subscribe((value) => {
      this.multipleVolume = value;
      this.validateForm.get('instanceId').reset();
    });

    this.validateForm.get('storage').valueChanges.subscribe((value) => {
      if(this.volumeCreate.volumeType == 'hdd') return (this.iops = 300)
      if(this.volumeCreate.volumeType == 'ssd') {
        if(value <= 40) return (this.iops = 400);
        this.iops = value * 10
      }
    });
  }

  dataSubjectStorage: Subject<any> = new Subject<any>();
  changeValueInput() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {
        console.log('total amount');
        // this.getTotalAmount()
      })
  }

  changeValueStorage(value) {
    this.dataSubjectStorage.next(value)
  }


  onChangeStatusSSD() {
    this.selectedValueSSD = true
    this.selectedValueHDD = false

    console.log('Selected option changed ssd:', this.selectedValueSSD);
    if(this.selectedValueSSD) {
      this.volumeCreate.volumeType = 'ssd'
      if(this.validateForm.get('storage').value <= 40) {
        this.iops = 400
      } else {
        this.iops = this.validateForm.get('storage').value * 10
      }
    }

  }


  onChangeStatusHDD() {
    this.selectedValueHDD = true
    this.selectedValueSSD = false
    console.log('Selected option changed hdd:', this.selectedValueHDD);
    // this.iops = this.validateForm.get('storage').value * 10
    if(this.selectedValueHDD) {
      this.volumeCreate.volumeType = 'hdd'
      this.iops = 300
    }

  }
  ngOnInit() {

    if(this.validateForm.controls.storage.value <= 40) return (this.iops = 400);
    this.iops = this.validateForm.controls.storage.value * 10

    this.getListInstance();
    this.changeValueInput()
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
    if(this.isInitSnapshot == true) {
      this.validateForm.controls.snapshot.setValidators(Validators.required)
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
      '', '', false, this.tokenService.get()?.userId)
      .subscribe(data => {
        this.listInstances = data.records;
        this.cdr.detectChanges();
      });
  }

  volumeCreate: VolumeCreate = new VolumeCreate();

  volumeInit() {
    this.volumeCreate.volumeType = this.selectedValueRadio;
    this.volumeCreate.volumeSize = this.validateForm.get('storage').value;
    this.volumeCreate.description = this.validateForm.get('description').value;
    if (this.validateForm.controls.isSnapshot.value == true) {
      this.volumeCreate.createFromSnapshotId = this.validateForm.controls.snapshot.value;
    } else {
      this.volumeCreate.createFromSnapshotId = null;
    }

    this.volumeCreate.instanceToAttachId = this.validateForm.controls.instanceId.value;
    this.volumeCreate.isMultiAttach = this.validateForm.controls.isMultiAttach.value;
    this.volumeCreate.isEncryption = this.validateForm.controls.isEncryption.value;
    this.volumeCreate.projectId = this.project.toString();
    this.volumeCreate.oneSMEAddonId = null;
    this.volumeCreate.serviceType = 2;
    this.volumeCreate.serviceInstanceId = 0;
    this.volumeCreate.customerId = this.tokenService.get()?.userId;
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
    this.volumeCreate.serviceName = this.validateForm.controls.name.value;
    this.volumeCreate.typeName =
      'SharedKernel.IntegrationEvents.Orders.Specifications.VolumeCreateSpecification,SharedKernel.IntegrationEvents,Version=1.0.0.0,Culture=neutral,PublicKeyToken=null';
    this.volumeCreate.userEmail = this.tokenService.get()?.email;
    this.volumeCreate.actorEmail = this.tokenService.get()?.email;
  }

  doCreateVolumeVPC() {
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
              this.router.navigate(['/app-smart-cloud/volumes']);
            }
          } else {
            this.isLoadingAction = false;
          }
        },
        error => {
          this.isLoadingAction = false;
        });
    }
  }

  clear() {
    this.validateForm.reset();
  }

}
