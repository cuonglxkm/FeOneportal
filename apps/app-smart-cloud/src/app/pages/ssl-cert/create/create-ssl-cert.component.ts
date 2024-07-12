import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FileSystemModel } from 'src/app/shared/models/file-system.model';
import { FormCreateSslCert } from 'src/app/shared/models/ssl-cert.model';
import { SSLCertService } from 'src/app/shared/services/ssl-cert.service';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { differenceInCalendarDays } from 'date-fns';
import { NAME_REGEX } from 'src/app/shared/constants/constants';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';


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

  today = new Date();
  disabledDate = (current: Date): boolean =>
    differenceInCalendarDays(current, this.today) < 0;

  expireDate: Date = new Date()
  form: FormGroup<{
    privateKey: FormControl<string>;
    publicKey: FormControl<string>
    certName: FormControl<string>
    passphrase: FormControl<string>
  }> = this.fb.group({
    privateKey: ['', Validators.required],
    certName: ['', [Validators.required, Validators.pattern(NAME_REGEX)]],
    publicKey: ['', Validators.required],
    passphrase: [''],
  });

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

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

  onChange(result: Date): void {
    this.expireDate = result
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
            this.router.navigate(['/app-smart-cloud/ssl-cert']);
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
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
  }

  navigateToList(){
    this.router.navigate(['/app-smart-cloud/ssl-cert']);
  }
}
