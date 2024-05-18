import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FileSystemModel, FormSearchFileSystem } from 'src/app/shared/models/file-system.model';
import { FormCreateFileSystemSnapShot } from 'src/app/shared/models/filesystem-snapshot';
import { FileSystemService } from 'src/app/shared/services/file-system.service';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { FormCreateSslCert } from 'src/app/shared/models/ssl-cert.model';
import { SSLCertService } from 'src/app/shared/services/ssl-cert.service';


@Component({
  selector: 'one-portal-create-ssl-cert',
  templateUrl: './create-ssl-cert.component.html',
  styleUrls: ['./create-ssl-cert.component.less'],
})
export class CreateSslCertComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string;
  pageSize: number = 10;
  pageIndex: number = 1;
  response: BaseResponse<FileSystemModel[]>;
  isLoading: boolean = false;
  isCheckBegin: boolean = false;
  customerId: number;
  selectedFileSystemName: string;
  
  formCreateeSslCert: FormCreateSslCert = new FormCreateSslCert();

  passwordVisible: boolean = false

  expireDate: Date = new Date()
  form: FormGroup<{
    privateKey: FormControl<string>;
    publicKey: FormControl<string>
    certName: FormControl<string>
    passphrase: FormControl<string>
  }> = this.fb.group({
    privateKey: ['', [Validators.required]],
    certName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-_ ]{0,254}$/)]],
    publicKey: ['', [Validators.required]],
    passphrase: ['', [Validators.required]],
  });



  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder,
     private SSLCertService: SSLCertService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }


  getData(): FormCreateSslCert {
    var dd = String(this.expireDate.getDate()).padStart(2, '0');
    var mm = String(this.expireDate.getMonth() + 1).padStart(2, '0');
    var yyyy = this.expireDate.getFullYear();

    let privateKey = this.form.controls.privateKey.value.split('\n').join('');
    let publicKey = this.form.controls.publicKey.value.split('\n').join('');

    let date = yyyy + '-' + mm + '-' + dd;
    this.formCreateeSslCert.customerId =
      this.tokenService.get()?.userId;
    this.formCreateeSslCert.regionId = this.region;
    this.formCreateeSslCert.vpcId = this.project;
    this.formCreateeSslCert.name =
      this.form.controls.certName.value;
    this.formCreateeSslCert.passphrase = this.form.controls.passphrase.value;
    this.formCreateeSslCert.privateKey = privateKey
    this.formCreateeSslCert.publicKey = publicKey
    this.formCreateeSslCert.expiration = date;
    return this.formCreateeSslCert;
  }
  
  handleCreate() {
    this.isLoading = true;
    if (this.form.valid) {
      this.formCreateeSslCert = this.getData();
      console.log(this.formCreateeSslCert);
      this.SSLCertService
        .create(this.formCreateeSslCert)
        .subscribe(
          (data) => {
            this.isLoading = false
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              'Tạo mới ssl cert thành công'
            );
            this.router.navigate(['/app-smart-cloud/file-system-snapshot/list']);
          },
          (error) => {
            this.isLoading = false
              this.notification.error(
                this.i18n.fanyi('app.status.fail'),
                'Tạo mới ssl cert thất bại'
              );
          }
        );
    }
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }
}
