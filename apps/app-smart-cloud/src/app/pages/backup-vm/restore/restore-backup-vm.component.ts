import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  ProjectModel,
  RegionModel,
} from '../../../../../../../libs/common-utils/src';
import { ActivatedRoute, Router } from '@angular/router';
import { BackupVmService } from '../../../shared/services/backup-vm.service';
import { getCurrentRegionAndProject } from '@shared';
import {
  BackupVm,
  RestoreFormCurrent,
  SecurityGroupBackup,
  VolumeBackup,
} from '../../../shared/models/backup-vm';
import { PackageBackupModel } from '../../../shared/models/package-backup.model';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import {
  DataPayment,
  InstanceCreate,
  IPPublicModel,
  ItemPayment,
  SHHKeyModel,
} from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {
  FormSearchNetwork,
  NetWorkModel,
  Port,
} from '../../../shared/models/vlan.model';
import { VlanService } from '../../../shared/services/vlan.service';
import { debounceTime, Subject } from 'rxjs';
import { SizeInCloudProject } from 'src/app/shared/models/project.model';
import { ProjectService } from 'src/app/shared/services/project.service';

class ConfigCustom {
  //cấu hình tùy chỉnh
  vCPU?: number = 0;
  ram?: number = 0;
  capacity?: number = 0;
}

@Component({
  selector: 'one-portal-restore-backup-vm',
  templateUrl: './restore-backup-vm.component.html',
  styleUrls: ['./restore-backup-vm.component.less'],
})
export class RestoreBackupVmComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  backupVmModel: BackupVm;
  projectDetail: SizeInCloudProject;
  backupPackage: PackageBackupModel;
  listExternalAttachVolume: VolumeBackup[] = [];
  listSecurityGroupBackups: SecurityGroupBackup[] = [];

  selectedOption: string = 'current';
  typeVpc: number;

  nameSecurityGroup = [];
  nameSecurityGroupTextUnique: string;
  nameSecurityGroupText: string[];

  nameFlavorTextUnique: string;
  nameFlavorText: string[];
  nameFlavor = [];

  nameVolumeBackupAttach = [];
  nameVolumeBackupAttachName: string[];
  nameVolumeBackupAttachNameUnique: string;

  isLoadingCurrent: boolean = false;
  isLoadingNew: boolean = false;

  listIPPublic: IPPublicModel[] = [];

  listSSHKey: SHHKeyModel[] = [];
  activeBlockPassword: boolean = true;
  activeBlockSSHKey: boolean = false;
  disableKeypair: boolean = false;

  numberMonth: number = 1;

  passwordVisible = false;

  validateForm = new FormGroup({
    formCurrent: new FormGroup({
      securityGroupIds: new FormControl(null as string[]),
      volumeAttachIds: new FormControl(null as number[]),
    }),
    formNew: new FormGroup({
      instanceName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9_]*$/),
      ]),
      ipPublic: new FormControl(0, [Validators.required]),
      securityGroupIds: new FormControl(null as string[]),
      vlan: new FormControl('', []),
      port: new FormControl(''),
      storage: new FormControl(1, [Validators.required]),
      ram: new FormControl(1, [Validators.required]),
      cpu: new FormControl(1, [Validators.required]),
      password: new FormControl(''),
      keypair: new FormControl(''),
      volumeAttachIds: new FormControl(null as number[]),
      newVolumeRestore: new FormControl(null as number[]),
    }),
  });

  get formCurrent() {
    return this.validateForm.get('formCurrent') as FormGroup;
  }

  get formNew() {
    return this.validateForm.get('formNew') as FormGroup;
  }

  constructor(
    private router: Router,
    private backupService: BackupVmService,
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService,
    private backupPackageService: PackageBackupService,
    private notification: NzNotificationService,
    private dataService: InstancesService,
    private vlanService: VlanService,
    private cdr: ChangeDetectorRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    if (this.activeBlockPassword == true) {
      this.initPassword();
    }
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/backup-vm']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type;
    // this.router.navigate(['/app-smart-cloud/backup-vm'])
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-vm']);
  }

  selectedSSHKeyName: string;
  password: string = '';

  initPassword(): void {
    console.log('here');
    this.activeBlockPassword = true;
    this.activeBlockSSHKey = false;
    this.selectedSSHKeyName = null;
    this.validateForm
      .get('formNew')
      .get('password')
      .setValidators([
        Validators.required,
        Validators.pattern(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{12,20}$/
        ),
      ]);
  }
  initSSHkey(): void {
    this.activeBlockPassword = false;
    this.activeBlockSSHKey = true;
    this.password = '';
    this.validateForm
      .get('formNew')
      .get('keypair')
      .setValidators([Validators.required]);
  }

  getAllSSHKey() {
    this.listSSHKey = [];
    this.dataService
      .getAllSSHKey(this.region, this.tokenService.get()?.userId, 999999, 0)
      .subscribe((data: any) => {
        data.records.forEach((e) => {
          const itemMapper = new SHHKeyModel();
          itemMapper.id = e.id;
          itemMapper.displayName = e.name;
          this.listSSHKey.push(itemMapper);
        });
      });
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); // Ngăn chặn hành vi mặc định của các phím mũi tên

      const tabs = document.querySelectorAll('.ant-tabs-tab'); // Lấy danh sách các tab
      const activeTab = document.querySelector('.ant-tabs-tab-active'); // Lấy tab đang active

      // Tìm index của tab đang active
      let activeTabIndex = Array.prototype.indexOf.call(tabs, activeTab);

      if (event.key === 'ArrowLeft') {
        activeTabIndex -= 1; // Di chuyển tới tab trước đó
      } else if (event.key === 'ArrowRight') {
        activeTabIndex += 1; // Di chuyển tới tab tiếp theo
      }

      // Kiểm tra xem tab có hợp lệ không
      if (activeTabIndex >= 0 && activeTabIndex < tabs.length) {
        (tabs[activeTabIndex] as HTMLElement).click(); // Kích hoạt tab mới
      }
    }
  }

  volumeUnitPrice = 0;
  volumeIntoMoney = 0;
  ramUnitPrice = 0;
  ramIntoMoney = 0;
  cpuUnitPrice = 0;
  cpuIntoMoney = 0;
  gpuUnitPrice = 0;
  gpuIntoMoney = 0;
  isCustomconfig = false;
  configCustom: ConfigCustom = new ConfigCustom();

  getUnitPrice(
    volumeSize: number,
    ram: number,
    cpu: number,
    gpu: number,
    gpuTypeOfferId: number
  ) {
    let tempInstance: InstanceCreate = new InstanceCreate();
    tempInstance.offerId = 0;
    tempInstance.flavorId = 0;
    tempInstance.volumeSize = volumeSize;
    tempInstance.ram = ram;
    tempInstance.cpu = cpu;
    tempInstance.gpuCount = gpu;
    tempInstance.gpuTypeOfferId = gpuTypeOfferId;
    tempInstance.projectId = this.project;
    tempInstance.regionId = this.region;
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(tempInstance);
    itemPayment.specificationType = 'instance_create';
    itemPayment.serviceDuration = 1;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.dataService.getPrices(dataPayment).subscribe((result) => {
      console.log('thanh tien/đơn giá', result);
      if (volumeSize == 1) {
        this.volumeUnitPrice = Number.parseFloat(
          result.data.totalAmount.amount
        );
        if (this.isCustomconfig) {
          this.volumeIntoMoney =
            this.volumeUnitPrice * this.configCustom.capacity;
        }
      }
      if (ram == 1) {
        this.ramUnitPrice = Number.parseFloat(result.data.totalAmount.amount);
        if (this.isCustomconfig) {
          this.ramIntoMoney = this.ramUnitPrice * this.configCustom.ram;
        }
      }
      if (cpu == 1) {
        this.cpuUnitPrice = Number.parseFloat(result.data.totalAmount.amount);
        if (this.isCustomconfig) {
          this.cpuIntoMoney = this.cpuUnitPrice * this.configCustom.vCPU;
        }
      }

      this.cdr.detectChanges();
    });
  }

  instanceCreate: InstanceCreate = new InstanceCreate();

  instanceInit() {
    this.instanceCreate.description = null;
    // this.instanceCreate.imageId = this.hdh;
    this.instanceCreate.iops = 0;
    // this.instanceCreate.vmType = this.activeBlockHDD ? 'hdd' : 'ssd';
    this.instanceCreate.keypairName = this.validateForm
      .get('formNew')
      .get('keypair').value;
    this.instanceCreate.securityGroups = this.validateForm
      .get('formNew')
      .get('securityGroupIds').value;
    this.instanceCreate.network = null;
    this.instanceCreate.isUsePrivateNetwork =
      this.validateForm.get('formNew').get('vlan').value == '' ? false : true;
    if (this.validateForm.get('formNew').get('vlan').value != '') {
      this.instanceCreate.privateNetId = this.validateForm
        .get('formNew')
        .get('vlan').value;
    }
    if (this.port != '') {
      this.instanceCreate.privatePortId = this.port;
    }
    this.instanceCreate.ipPublic = this.validateForm
      .get('formNew')
      .get('ipPublic').value;
    this.instanceCreate.password = this.validateForm
      .get('formNew')
      .get('password').value;
    // this.instanceCreate.snapshotCloudId = this.selectedSnapshot;
    this.instanceCreate.encryption = false;
    // this.instanceCreate.isUseIPv6 = this.isUseIPv6;
    this.instanceCreate.addRam = 0;
    this.instanceCreate.addCpu = 0;
    this.instanceCreate.addBttn = 0;
    this.instanceCreate.addBtqt = 0;
    this.instanceCreate.poolName = null;
    this.instanceCreate.usedMss = false;
    this.instanceCreate.customerUsingMss = null;
    // if (this.isCustomconfig) {
    this.instanceCreate.offerId = 0;
    this.instanceCreate.flavorId = 0;
    this.instanceCreate.ram = this.configCustom.ram;
    this.instanceCreate.cpu = this.configCustom.vCPU;
    this.instanceCreate.volumeSize = this.configCustom.capacity;
    // }
    // this.instanceCreate.volumeType = this.activeBlockHDD ? 'hdd' : 'ssd';
    this.instanceCreate.projectId = this.project;
    this.instanceCreate.oneSMEAddonId = null;
    this.instanceCreate.serviceType = 1;
    this.instanceCreate.serviceInstanceId = 0;
    // this.instanceCreate.customerId = this.tokenService.get()?.userId;

    // let currentDate = new Date();
    // let lastDate = new Date();
    // lastDate.setDate(currentDate.getDate() + this.numberMonth * 30);
    // this.instanceCreate.createDate = currentDate.toISOString().substring(0, 19);
    // this.instanceCreate.expireDate = lastDate.toISOString().substring(0, 19);

    this.instanceCreate.saleDept = null;
    this.instanceCreate.saleDeptCode = null;
    this.instanceCreate.contactPersonEmail = null;
    this.instanceCreate.contactPersonPhone = null;
    this.instanceCreate.contactPersonName = null;
    this.instanceCreate.note = null;
    this.instanceCreate.createDateInContract = null;
    this.instanceCreate.am = null;
    this.instanceCreate.amManager = null;
    this.instanceCreate.isTrial = false;
    this.instanceCreate.couponCode = null;
    this.instanceCreate.dhsxkd_SubscriptionId = null;
    this.instanceCreate.dSubscriptionNumber = null;
    this.instanceCreate.dSubscriptionType = null;
    this.instanceCreate.oneSME_SubscriptionId = null;
    this.instanceCreate.regionId = this.region;
    // this.instanceCreate.userEmail = this.tokenService.get()['email'];
    // this.instanceCreate.actorEmail = this.tokenService.get()['email'];
  }

  totalAmount: number = 0;
  totalincludesVAT: number = 0;

  getTotalAmount() {
    this.instanceInit();
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.instanceCreate);
    itemPayment.specificationType = 'instance_create';
    itemPayment.serviceDuration = 1;
    itemPayment.sortItem = 0;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = this.project;
    this.dataService.getPrices(dataPayment).subscribe((result) => {
      console.log('thanh tien', result);
      this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
      this.totalincludesVAT = Number.parseFloat(
        result.data.totalPayment.amount
      );
      this.cdr.detectChanges();
    });
  }

  totalAmountVolume = 0;
  totalAmountVolumeVAT = 0;

  getDetailBackupById(id) {
    this.backupService.detail(id).subscribe((data) => {
      this.backupVmModel = data;

      this.listExternalAttachVolume = this.backupVmModel?.volumeBackups.filter(
        (e) => e.isBootable == false
      );

      this.listSecurityGroupBackups = this.backupVmModel.securityGroupBackups;
      
      this.backupVmModel?.securityGroupBackups.forEach((item) => {
        this.nameSecurityGroup?.push(item.sgName);
      });

      this.backupVmModel?.systemInfoBackups.forEach((item) => {
        this.nameFlavor?.push(item.osName);
      });

      this.backupVmModel?.volumeBackups.forEach((item) => {
        if (item.isBootable == false) {
          this.nameVolumeBackupAttach?.push(item.name);
        }
      });

      this.nameSecurityGroupText = Array.from(new Set(this.nameSecurityGroup));
      this.nameSecurityGroupTextUnique = this.nameSecurityGroupText.join('\n');
      console.log('name', this.nameSecurityGroup);
      console.log('unique', this.nameSecurityGroupText);

      this.nameFlavorText = Array.from(new Set(this.nameFlavor));
      this.nameFlavorTextUnique = this.nameFlavorText.join('\n');
      console.log('name', this.nameFlavorText);
      console.log('unique', this.nameFlavorTextUnique);

      this.nameVolumeBackupAttachName = Array.from(
        new Set(this.nameVolumeBackupAttach)
      );
      this.nameVolumeBackupAttachNameUnique =
        this.nameVolumeBackupAttachName.join('\n');
      console.log('name', this.nameVolumeBackupAttachName);
      console.log('unique', this.nameVolumeBackupAttachNameUnique);

      this.getBackupPackage(this.backupVmModel?.backupPacketId);
    });
  }

  onKeyDown(event: KeyboardEvent) {
    // Lấy giá trị của phím được nhấn
    const key = event.key;
    // Kiểm tra xem phím nhấn có phải là một số hoặc phím di chuyển không
    if (
      (isNaN(Number(key)) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight') ||
      key === '.'
    ) {
      // Nếu không phải số hoặc đã nhập dấu chấm và đã có dấu chấm trong giá trị hiện tại
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  dataSubjectRam: Subject<any> = new Subject<any>();
  changeRam(value: number) {
    this.dataSubjectRam.next(value);
  }
  onChangeRam() {
    this.dataSubjectRam
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.getUnitPrice(0, 1, 0, 0, null);
        if (
          this.configCustom.vCPU != 0 &&
          this.configCustom.ram != 0 &&
          this.configCustom.capacity != 0
        ) {
          this.getTotalAmount();
        } else if (this.configCustom.ram == 0) {
          this.totalAmount = 0;
          this.totalincludesVAT = 0;
        }
      });
  }

  dataSubjectCapacity: Subject<any> = new Subject<any>();
  changeCapacity(value: number) {
    this.dataSubjectCapacity.next(value);
  }
  onChangeCapacity() {
    this.dataSubjectCapacity
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.getUnitPrice(1, 0, 0, 0, null);
        if (
          this.configCustom.vCPU != 0 &&
          this.configCustom.ram != 0 &&
          this.configCustom.capacity != 0
        ) {
          this.getTotalAmount();
        } else if (this.configCustom.capacity == 0) {
          this.totalAmount = 0;
          this.totalincludesVAT = 0;
        }
      });
  }

  dataSubjectVCPU: Subject<any> = new Subject<any>();
  changeVCPU(value: number) {
    this.dataSubjectVCPU.next(value);
  }
  onChangeVCPU() {
    this.dataSubjectVCPU
      .pipe(
        debounceTime(500) // Đợi 500ms sau khi người dùng dừng nhập trước khi xử lý sự kiện
      )
      .subscribe((res) => {
        this.getUnitPrice(0, 0, 1, 0, null);
        if (
          this.configCustom.vCPU != 0 &&
          this.configCustom.ram != 0 &&
          this.configCustom.capacity != 0
        ) {
          this.getTotalAmount();
        } else if (this.configCustom.vCPU == 0) {
          this.totalAmount = 0;
          this.totalincludesVAT = 0;
        }
      });
  }

  onSelectionChange(): void {
    console.log('Selected option:', this.selectedOption);
    // Here, you can add logic based on the selection
    if (this.selectedOption === 'current') {
      this.restoreToCurrentVM();
    } else if (this.selectedOption === 'new') {
      this.restoreToNewVM();
    }
  }

  private restoreToCurrentVM(): void {
    console.log('Restoring to the current virtual machine...');
    // Add your restore logic here
    // this.validateForm.get('formCurrent').get('')
    console.log(
      'formCurrent',
      this.validateForm.get('formCurrent').getRawValue()
    );
  }

  private restoreToNewVM(): void {
    console.log('Restoring to a new virtual machine...');
    // Add your restore logic here
  }

  submitFormCurrent() {
    this.isLoadingCurrent = true;
    console.log('current', 'confirm click');
    let formRestoreCurrent = new RestoreFormCurrent();
    formRestoreCurrent.instanceBackupId = this.backupVmModel?.id;
    this.backupService.restoreCurrentBackupVm(formRestoreCurrent).subscribe(
      (data) => {
        this.isLoadingCurrent = false;
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          'Khôi phục vào máy ảo hiện tại thành công'
        );
        this.router.navigate(['/app-smart-cloud/backup-vm']);
      },
      (error) => {
        this.isLoadingCurrent = false;
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          'Khôi phục vào máy ảo hiện tại thất bại' + error.error.detail
        );
      }
    );
  }

  getProjectVpc(id) {
    this.projectService.getProjectVpc(id).subscribe((data) => {
      this.projectDetail = data;
    });
  }

  getBackupPackage(value) {
    this.backupPackageService.detail(value).subscribe((data) => {
      this.backupPackage = data;
    });
  }

  getAllIPPublic() {
    this.dataService
      .getAllIPPublic(
        this.project,
        '',
        this.tokenService.get()?.userId,
        this.region,
        9999,
        1,
        true
      )
      .subscribe((data: any) => {
        const currentDateTime = new Date().toISOString();
        this.listIPPublic = data.records.filter(
          (e) =>
            e.status == 0 && new Date(e.expiredDate) > new Date(currentDateTime)
        );
        console.log('list IP public', this.listIPPublic);
      });
  }

  listVlanNetwork: NetWorkModel[] = [];

  // vlanNetwork: string = '';
  getListNetwork(): void {
    let formSearchNetwork: FormSearchNetwork = new FormSearchNetwork();
    formSearchNetwork.region = this.region;
    formSearchNetwork.project = this.project;
    formSearchNetwork.pageNumber = 0;
    formSearchNetwork.pageSize = 9999;
    formSearchNetwork.vlanName = '';
    this.vlanService
      .getVlanNetworks(formSearchNetwork)
      .subscribe((data: any) => {
        this.listVlanNetwork = data.records;
        this.cdr.detectChanges();
      });
  }

  listPort: Port[] = [];
  port: string = '';
  hidePort: boolean = true;

  getListPort() {
    if (this.validateForm.get('formNew').get('vlan').value == '') {
      this.hidePort = true;
      this.port = '';
    } else {
      this.hidePort = false;
      this.listPort = [
        {
          id: '',
          name: '',
          fixedIPs: ['Ngẫu nhiên'],
          macAddress: null,
          attachedDevice: null,
          status: null,
          adminStateUp: null,
          instanceName: null,
          subnetId: null,
          attachedDeviceId: null,
        },
      ];
      this.dataService
        .getListAllPortByNetwork(
          this.validateForm.get('formNew').get('vlan').value,
          this.region
        )
        .subscribe({
          next: (data) => {
            data.forEach((e: Port) => {
              this.listPort.push(e);
            });
          },
          error: (e) => {
            this.notification.error(
              e.statusText,
              this.i18n.fanyi('app.notify.get.list.port')
            );
          },
        });
    }
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    const idBackup = this.activatedRoute.snapshot.paramMap.get('id');
    if (idBackup != undefined || idBackup != null) {
      this.getDetailBackupById(idBackup);
      this.getProjectVpc(this.project);
    }

    this.getAllIPPublic();
    this.getListNetwork();
    this.onChangeCapacity();
    this.onChangeRam();
    this.onChangeVCPU();
    this.getAllSSHKey();
  }
}
