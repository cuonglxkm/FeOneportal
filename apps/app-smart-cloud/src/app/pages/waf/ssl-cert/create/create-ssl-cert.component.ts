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
import { differenceInCalendarDays } from 'date-fns';
import { NAME_REGEX } from 'src/app/shared/constants/constants';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';


@Component({
  selector: 'one-portal-create-ssl-cert-waf',
  templateUrl: './create-ssl-cert.component.html',
  styleUrls: ['./create-ssl-cert.component.less'],
})
export class CreateSslCertWAFComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string;
  isLoading: boolean = false;
  isCheckBegin: boolean = false;
  customerId: number;
  selectedFileSystemName: string;
  fileList: NzUploadFile[] = [];
  formCreateeSslCert: FormCreateSslCert = new FormCreateSslCert();

  passwordVisible: boolean = false
  uploadMethod: string = '1'
  uploadMethodList = [
    { label: 'Import from the certificate file', value: '1' },
    { label: 'Upload from certificate file (with passphrase)', value: '2' },
    { label: 'Paste certificate content', value: '3' },
  ];

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




  handleChange(info: NzUploadChangeParam): void {
    let fileList = [...info.fileList];
    const maxFiles = 10;
    const maxSize = 44 * 1024;
    const allowedFormats = ['pem', 'key', 'crt', 'cer', 'der', 'pfx', 'jks'];

    const validationErrors = new Map<string, string[]>();

    fileList.forEach(file => {
      const fileErrors: string[] = [];

      if (file.size > maxSize) {
        fileErrors.push(`File không được vượt quá 44kb.`);
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedFormats.includes(fileExtension)) {
        fileErrors.push(`File không đúng định dạng`);
      }

      if (fileList.length > maxFiles) {
        this.notification.error('File Limit Exceeded', `Không thể tải quá ${maxFiles} files.`);
        fileList = fileList.slice(0, maxFiles);
      }

      if (fileErrors.length > 0) {
        validationErrors.set(file.name, fileErrors);
      }
    });

    if (fileList.length > maxFiles) {
      this.notification.error('File Limit Exceeded', `Không thể tải quá  ${maxFiles} files.`);
      fileList = fileList.slice(0, maxFiles); 
    }

    if (validationErrors.size > 0) {
      validationErrors.forEach((errors, fileName) => {
        this.notification.error('Thất bại', `${errors.join('<br>')}`);
      });

      
      fileList = fileList.filter(file => !validationErrors.has(file.name));
    }

    this.fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
  }
  
  handleCreate() {
    this.isLoading = true;
    if (this.form.valid) {
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


  navigateToList(){
    this.router.navigate(['/app-smart-cloud/ssl-cert']);
  }
}
