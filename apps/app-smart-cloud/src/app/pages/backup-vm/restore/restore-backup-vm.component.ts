import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  ProjectModel,
  ProjectService,
  RegionModel,
  SizeInCloudProject
} from '../../../../../../../libs/common-utils/src';
import { ActivatedRoute, Router } from '@angular/router';
import { BackupVmService } from '../../../shared/services/backup-vm.service';
import { getCurrentRegionAndProject } from '@shared';
import { BackupVm, RestoreFormCurrent } from '../../../shared/models/backup-vm';
import { PackageBackupModel } from '../../../shared/models/package-backup.model';
import { PackageBackupService } from '../../../shared/services/package-backup.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { IPPublicModel } from '../../instances/instances.model';
import { InstancesService } from '../../instances/instances.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormSearchNetwork, NetWorkModel, Port } from '../../../shared/models/vlan.model';
import { VlanService } from '../../../shared/services/vlan.service';

@Component({
  selector: 'one-portal-restore-backup-vm',
  templateUrl: './restore-backup-vm.component.html',
  styleUrls: ['./restore-backup-vm.component.less'],
})
export class RestoreBackupVmComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  backupVmModel: BackupVm;
  projectDetail: SizeInCloudProject
  backupPackage: PackageBackupModel

  selectedOption: string = 'current';
  typeVpc: number

  nameSecurityGroup = []
  nameSecurityGroupTextUnique: string
  nameSecurityGroupText: string[]

  nameFlavorTextUnique: string
  nameFlavorText: string[]
  nameFlavor = []

  nameVolumeBackupAttach = []
  nameVolumeBackupAttachName: string[]
  nameVolumeBackupAttachNameUnique: string

  isLoadingCurrent: boolean = false
  isLoadingNew: boolean = false

  listIPPublic: IPPublicModel[] = [];


  validateForm = new FormGroup({
    formCurrent: new FormGroup({
      securityGroupIds: new FormControl(null as string[]),
      volumeAttachIds: new FormControl(null as number[])
    }),
    formNew: new FormGroup({
      instanceName: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/)]),
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
      newVolumeRestore: new FormControl(null as number[])
    })
  })

  get formCurrent() {
    return this.validateForm.get('formCurrent') as FormGroup;
  }

  get formNew() {
    return this.validateForm.get('formNew') as FormGroup;
  }

  constructor(private router: Router,
              private backupService: BackupVmService,
              private activatedRoute: ActivatedRoute,
              private projectService: ProjectService,
              private backupPackageService: PackageBackupService,
              private notification: NzNotificationService,
              private dataService: InstancesService,
              private vlanService: VlanService,
              private cdr: ChangeDetectorRef,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.router.navigate(['/app-smart-cloud/backup-vm'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    this.typeVpc =project?.type
    // this.router.navigate(['/app-smart-cloud/backup-vm'])
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-vm'])
  }

  getDetailBackupById(id) {
    this.backupService.detail(id).subscribe(data => {
      this.backupVmModel = data

      this.backupVmModel?.securityGroupBackups.forEach(item => {
        this.nameSecurityGroup?.push(item.sgName)
      })

      this.backupVmModel?.systemInfoBackups.forEach(item => {
        this.nameFlavor?.push(item.osName)
      })

      this.backupVmModel?.volumeBackups.forEach(item => {
        if(item.isBootable == false) {
          this.nameVolumeBackupAttach?.push(item.name)
        }
      })

      this.nameSecurityGroupText = Array.from(new Set(this.nameSecurityGroup))
      this.nameSecurityGroupTextUnique = this.nameSecurityGroupText.join('\n')
      console.log('name', this.nameSecurityGroup)
      console.log('unique', this.nameSecurityGroupText)

      this.nameFlavorText = Array.from(new Set(this.nameFlavor))
      this.nameFlavorTextUnique = this.nameFlavorText.join('\n')
      console.log('name', this.nameFlavorText)
      console.log('unique', this.nameFlavorTextUnique)

      this.nameVolumeBackupAttachName = Array.from(new Set(this.nameVolumeBackupAttach))
      this.nameVolumeBackupAttachNameUnique = this.nameVolumeBackupAttachName.join('\n')
      console.log('name', this.nameVolumeBackupAttachName)
      console.log('unique', this.nameVolumeBackupAttachNameUnique)

      this.getBackupPackage(this.backupVmModel?.backupPacketId);
    })
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
    console.log('formCurrent',this.validateForm.get('formCurrent').getRawValue())
  }

  private restoreToNewVM(): void {
    console.log('Restoring to a new virtual machine...');
    // Add your restore logic here
  }

  submitFormCurrent() {
    this.isLoadingCurrent = true
    console.log('current', 'confirm click')
    let formRestoreCurrent = new RestoreFormCurrent();
    formRestoreCurrent.instanceBackupId = this.backupVmModel?.id
    this.backupService.restoreCurrentBackupVm(formRestoreCurrent).subscribe(data => {
      this.isLoadingCurrent = false
      this.notification.success(this.i18n.fanyi('app.status.success'), 'Khôi phục vào máy ảo hiện tại thành công')
      this.router.navigate(['/app-smart-cloud/backup-vm'])
    }, error => {
      this.isLoadingCurrent = false
      this.notification.error(this.i18n.fanyi('app.status.fail'), 'Khôi phục vào máy ảo hiện tại thất bại' + error.error.detail)
    })
  }

  getProjectVpc(id) {
    this.projectService.getProjectVpc(id).subscribe(data => {
      this.projectDetail = data
    })
  }

  getBackupPackage(value) {
    this.backupPackageService.detail(value).subscribe(data => {
      this.backupPackage = data;
    });
  }

  getAllIPPublic() {
    this.dataService.getAllIPPublic(this.project, '', this.tokenService.get()?.userId, this.region, 9999, 1, true).subscribe((data: any) => {
        const currentDateTime = new Date().toISOString();
        this.listIPPublic = data.records.filter(
          (e) =>
            e.status == 0 && new Date(e.expiredDate) > new Date(currentDateTime)
        );
        console.log('list IP public', this.listIPPublic);
      });
  }

  listVlanNetwork: NetWorkModel[] = [];
  vlanNetwork: string = '';
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
      this.dataService.getListAllPortByNetwork(this.validateForm.get('formNew').get('vlan').value, this.region).subscribe({
          next: (data) => {data.forEach((e: Port) => {
              this.listPort.push(e);
            });
          },
          error: (e) => {
            this.notification.error(e.statusText, this.i18n.fanyi('app.notify.get.list.port'));
          },
        });
    }
  }
  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    const idBackup = this.activatedRoute.snapshot.paramMap.get('id');
    if(idBackup != undefined || idBackup != null) {
      this.getDetailBackupById(idBackup);
      this.getProjectVpc(this.project)
    }

    this.getAllIPPublic();
    this.getListNetwork();
  }
}
