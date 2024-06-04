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
import { BackupVolume } from '../backup-volume.model';
import { PackageBackupModel } from '../../../../../shared/models/package-backup.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VolumeDTO } from '../../../../../shared/dto/volume.dto';
import { debounceTime, Subject } from 'rxjs';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ConfigurationsService } from '../../../../../shared/services/configurations.service';

@Component({
  selector: 'one-portal-restore-backup-volume',
  templateUrl: './restore-backup-volume.component.html',
  styleUrls: ['./restore-backup-volume.component.less'],
})
export class RestoreBackupVolumeComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = true;

  idBackupVolume: number;

  projectDetail: SizeInCloudProject

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
        validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), this.duplicateNameValidator.bind(this)],
      }),
      storage: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[0-9]*$/)]
      })
    }),
  });

  listVolumes: VolumeDTO[] = [];

  volumeSelected: any;

  volumeDetail: VolumeDTO;

  nameList: string[] = []

  minStorage: number = 0;
  stepStorage: number = 0;
  valueString: string;
  maxStorage: number = 0;

  dataSubjectStorage: Subject<any> = new Subject<any>();

  constructor(private router: Router,
              private backupVolumeService: BackupVolumeService,
              private activatedRoute: ActivatedRoute,
              private projectService: ProjectService,
              private backupPackageService: PackageBackupService,
              private notification: NzNotificationService,
              private volumeService: VolumeService,
              private cdr: ChangeDetectorRef,
              private configurationsService: ConfigurationsService,
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
      this.minStorage = Number.parseInt(this.valueString?.split('#')[0])
      this.stepStorage = Number.parseInt(this.valueString?.split('#')[1])
      this.maxStorage = Number.parseInt(this.valueString?.split('#')[2])
    })
  }

  regionChanged(region: RegionModel) {
    this.router.navigate(['/app-smart-cloud/backup-volume'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type
    // this.getListVolume(true);
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/backup-volume'])
  }

  changeValueStorage(value) {
    this.dataSubjectStorage.next(value);
  }

  onChangeValueStorage() {
    this.dataSubjectStorage.pipe(debounceTime(500))
      .subscribe((res) => {
        if((res % this.stepStorage) > 0) {
          this.notification.warning('', this.i18n.fanyi('app.notify.amount.capacity', {number: this.stepStorage}))
          this.validateForm.get('formNew').get('storage').setValue(res - (res % this.stepStorage))
        }
        console.log('total amount');
        // this.getTotalAmount();
      });
  }

  onSelectionChange(): void {
    console.log('Selected option:', this.selectedOption);
    if (this.selectedOption === 'current') {
      this.validateForm.get('formNew').get('volumeName').clearValidators()
      this.validateForm.get('formNew').get('volumeName').updateValueAndValidity()
    } else if (this.selectedOption === 'new') {

    }
    this.cdr.detectChanges();
  }

  getDetailBackupVolume(id) {
    this.isLoading = true
    this.backupVolumeService.detail(id).subscribe(data => {
      this.backupVolume = data;
      this.isLoading = false
      if(this.backupVolume?.backupPackageId != null) {
        this.backupPackageService.detail(this.backupVolume?.backupPackageId).subscribe(data => {
          this.backupPackageDetail = data;
        });
      }
    }, error => {
      this.isLoading = false
      this.router.navigate(['/app-smart-cloud/backup-volume'])
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('volume.notification.access.denied'))
    })
  }

  getInfoProjectVpc(id) {
    this.projectService.getProjectVpc(id).subscribe(data => {
      this.projectDetail = data
    })
  }

  getListVolumes() {
    this.isLoading = true
    this.volumeService.getVolumes(this.tokenService.get()?.userId, this.project,
      this.region, 9999, 1, null, null)
      .pipe(debounceTime(500))
      .subscribe(data => {
          this.isLoading = false;
          data.records.forEach(item => {
            this.nameList?.push(item.name)
            if(item.sizeInGB >= this.backupVolume?.size) {
              this.listVolumes?.push(item);
            }
          })
          this.validateForm.get('formCurrent').get('volumeId').setValue(this.listVolumes[0]?.id)
      }, error => {
        this.isLoading = false;
        this.listVolumes = [];
        console.log(error);
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'));
      });
  }

  getVolumeDetail(id) {
    this.volumeService.getVolumeById(id).subscribe(data => {
      this.volumeDetail = data
    })
  }

  volumeSelectedChange(value) {
    console.log('volume selected', value)
    this.volumeSelected = value
    if(this.volumeSelected != undefined) {
      this.getVolumeDetail(this.volumeSelected)
    }
  }
  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.idBackupVolume = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'))
    this.getDetailBackupVolume(this.idBackupVolume);
    this.getInfoProjectVpc(this.project);
    this.getListVolumes();
  }
}
