import { Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { NAME_REGEX } from 'src/app/shared/constants/constants';
import { WafService } from 'src/app/shared/services/waf.service';
import { SslCertRequest } from '../../waf.model';

@Component({
  selector: 'one-portal-create-ssl-cert-waf',
  templateUrl: './create-ssl-cert.component.html',
  styleUrls: ['./create-ssl-cert.component.less'],
})
export class CreateSslCertWAFComponent implements OnInit {
  value: string;
  isLoading: boolean = false;
  isCheckBegin: boolean = false;
  customerId: number;
  selectedFileSystemName: string;
  fileList: NzUploadFile[] = [];
  formCreateeSslCert: SslCertRequest = new SslCertRequest();

  passwordVisible: boolean = false;
  uploadMethod: string = '1';
  uploadMethodList = [
    { label: 'Import from the certificate file', value: '1' },
    { label: 'Paste certificate content', value: '2' },
  ];

  form: FormGroup<{
    privateKey: FormControl<string>;
    certificate: FormControl<string>;
    certName: FormControl<string>;
    remarks: FormControl<string>;
  }> = this.fb.group({
    privateKey: ['', Validators.required],
    certName: ['', [Validators.required, Validators.pattern(NAME_REGEX)]],
    certificate: ['', Validators.required],
    remarks: ['']
  });

  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder,
    private SSLCertService: WafService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {

  }

  handleChangeMethod(event: any){
    console.log(event);
    if(event === '2'){
      this.form.reset()
      this.fileList = []
    }else{
      this.form.reset()
    }
  }

  handleChange(info: NzUploadChangeParam): void {
    let fileList = [...info.fileList];
    const maxFiles = 10;
    const maxSize = 44 * 1024;
    const allowedFormats = ['pem', 'key', 'crt'];

    const validationErrors = new Map<string, string[]>();

    fileList.forEach((file) => {
      const fileErrors: string[] = [];

      if (file.size > maxSize) {
        fileErrors.push(`File không được vượt quá 44kb.`);
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedFormats.includes(fileExtension)) {
        fileErrors.push(`File không đúng định dạng`);
      }

      if (fileList.length > maxFiles) {
        this.notification.error(
          'File Limit Exceeded',
          `Không thể tải quá ${maxFiles} files.`
        );
        fileList = fileList.slice(0, maxFiles);
      }

      if (fileErrors.length > 0) {
        validationErrors.set(file.name, fileErrors);
      }
    });

    if (fileList.length > maxFiles) {
      this.notification.error(
        'File Limit Exceeded',
        `Không thể tải quá  ${maxFiles} files.`
      );
      fileList = fileList.slice(0, maxFiles);
    }

    if (validationErrors.size > 0) {
      validationErrors.forEach((errors, fileName) => {
        this.notification.error('Thất bại', `${errors.join('<br>')}`);
      });

      fileList = fileList.filter((file) => !validationErrors.has(file.name));
    }

    this.fileList = fileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    this.getData();
  }

  async getData() {
    const allowedFormats = ['pem', 'key', 'crt'];

    const validFiles = this.fileList.filter((file) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      return allowedFormats.includes(fileExtension);
    });

    for (const file of validFiles) {
      try {
        const content = await this.readFileContent(file);
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

        if (fileExtension === 'crt') {
          this.form.controls.certificate.setValue(content);
        } else if (fileExtension === 'key') {
          this.form.controls.privateKey.setValue(content);
        }
      } catch (error) {
        console.error(`Error reading ${file.name}:`, error);
      }
    }
    this.formCreateeSslCert.name = this.form.get('certName').value;
    this.formCreateeSslCert.remarks = this.form.get('remarks').value;
    if(this.uploadMethod === '2'){
      this.formCreateeSslCert.certificate = this.form.get('certificate').value.split('\n').join('');
      this.formCreateeSslCert.privateKey = this.form.get('privateKey').value.split('\n').join('');
    }else{
      this.formCreateeSslCert.certificate = this.form.get('certificate').value;
      this.formCreateeSslCert.privateKey = this.form.get('privateKey').value;
    }
    return this.formCreateeSslCert;
  }

  readFileContent(file: NzUploadFile): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file.originFileObj as File);
    });
  }
  async handleCreate() {
    this.isLoading = true;
    this.formCreateeSslCert = await this.getData();
    console.log(this.formCreateeSslCert);
    this.SSLCertService.createSSlCert(this.formCreateeSslCert).subscribe(
      (data) => {
        this.isLoading = false;
        this.router.navigate(['/app-smart-cloud/waf/ssl-cert']);
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          'Tạo mới ssl cert thành công'
        );
      },
      (error) => {
        this.isLoading = false;
        if (error.error.detail.includes('SSL name you provided is already')) {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('Tên chứng chỉ đã tồn tại')
          );
        }else if (error.error.detail.includes('SSL content you provided is already')) {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('Nội dung chứng chỉ đã tồn tại')
          );
        }else{
          this.notification.error(
            this.i18n.fanyi('app.status.fail'), 'Tạo mới ssl cert thất bại');
        }
      }
    );
  }
}
