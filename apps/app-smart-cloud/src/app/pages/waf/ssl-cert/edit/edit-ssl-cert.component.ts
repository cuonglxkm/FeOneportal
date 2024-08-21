import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { NAME_CERT_REGEX, NAME_REGEX } from 'src/app/shared/constants/constants';
import { WafService } from 'src/app/shared/services/waf.service';
import { SslCertRequest } from '../../waf.model';

@Component({
  selector: 'one-portal-edit-ssl-cert-waf',
  templateUrl: './edit-ssl-cert.component.html',
  styleUrls: ['./edit-ssl-cert.component.less'],
})
export class EditSslCertWAFComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string;
  isLoading: boolean = false;
  isCheckBegin: boolean = false;
  customerId: number;
  selectedFileSystemName: string;
  fileList: NzUploadFile[] = [];
  formEditSslCert: SslCertRequest = new SslCertRequest();
  SslCertDetail: any
  passwordVisible: boolean = false;
  uploadMethod: string = '1';
  uploadMethodList = [
    { label: 'Import from the certificate file', value: '1' },
    { label: 'Paste certificate content', value: '2' },
  ];
  id: number
  caCertificate: string = '';
  form: FormGroup<{
    privateKey: FormControl<string>;
    certificate: FormControl<string>;
    certName: FormControl<string>;
    remarks: FormControl<string>;
  }> = this.fb.group({
    privateKey: ['', Validators.required],
    certName: ['', [Validators.required, Validators.pattern(NAME_CERT_REGEX)]],
    certificate: ['', Validators.required],
    remarks: ['']
  });

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder,
    private SSLCertService: WafService,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'))
    this.getDetailSslCert(this.id)
  }

  getDetailSslCert(id: number) {
    this.SSLCertService.getDetailSslCert(id).subscribe((res) => {
      this.SslCertDetail = res
      this.form.get('certName').setValue(res.name)
      this.form.get('remarks').setValue(res.remarks)
    }, (err) => {
      this.notification.error('Thất bại', `Lấy dữ liệu Ssl Cert thất bại`);
    })
  }

  handleChangeMethod(event: any){
    console.log(event);
    if(event === '2'){
      this.form.controls.privateKey.reset()
      this.form.controls.certificate.reset()
      this.form.get('certName').setValue(this.SslCertDetail.name)
      this.form.get('remarks').setValue(this.SslCertDetail.remarks)
      this.fileList = []
    }else{
      this.form.controls.privateKey.reset()
      this.form.controls.certificate.reset()
      this.form.get('certName').setValue(this.SslCertDetail.name)
      this.form.get('remarks').setValue(this.SslCertDetail.remarks)
    }
  }

  handleChange(info: NzUploadChangeParam): void {
    let fileList = [...info.fileList];
    const maxSize = 44 * 1024;
    const allowedFormats = ['pem', 'key', 'crt'];
  
    const validationErrors = new Map<string, string[]>();
  
    let maxFiles = 2;
  
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
          if(this.form.get('privateKey').value === ''){
            this.form.controls.privateKey.removeValidators(Validators.required);
            this.form.controls.privateKey.setValue('');
          }
        } else if (fileExtension === 'key') {
          this.form.controls.privateKey.setValue(content);
          if(this.form.get('certificate').value === ''){
            this.form.controls.certificate.removeValidators(Validators.required);
            this.form.controls.certificate.setValue('');
          }    
        }else if (fileExtension === 'pem') {
          if(content.includes('-----BEGIN PRIVATE KEY-----') && !content.includes('-----BEGIN CERTIFICATE----')){
            const privateKey = content.substring(
              content.indexOf('-----BEGIN PRIVATE KEY-----'),
              content.indexOf('-----END PRIVATE KEY-----') + '-----END PRIVATE KEY-----'.length
            );
            this.form.controls.privateKey.setValue(privateKey);
            if(this.form.get('certificate').value === ''){
              this.form.controls.certificate.removeValidators(Validators.required);
              this.form.controls.certificate.setValue('');
            }  
          }else if(content.includes('-----BEGIN CERTIFICATE----') && !content.includes('-----BEGIN PRIVATE KEY-----')){
            const certificate = content.substring(
              content.indexOf('-----BEGIN CERTIFICATE-----'),
              content.indexOf('-----END CERTIFICATE-----') + '-----END CERTIFICATE-----'.length
            );          
            this.form.controls.certificate.setValue(certificate);
            if(this.form.get('privateKey').value === ''){
              this.form.controls.privateKey.removeValidators(Validators.required);
              this.form.controls.privateKey.setValue('');
            }
          }else if(content.includes('-----BEGIN CERTIFICATE----') && content.includes('-----BEGIN PRIVATE KEY-----')){
            const privateKey = content.substring(
              content.indexOf('-----BEGIN PRIVATE KEY-----'),
              content.indexOf('-----END PRIVATE KEY-----') + '-----END PRIVATE KEY-----'.length
            );
            const certificate = content.substring(
              content.indexOf('-----BEGIN CERTIFICATE-----'),
              content.indexOf('-----END CERTIFICATE-----') + '-----END CERTIFICATE-----'.length
            );  
            this.form.controls.certificate.setValue(certificate);
            this.form.controls.privateKey.setValue(privateKey);
          }
        }
      } catch (error) {
        console.error(`Error reading ${file.name}:`, error);
      }
    }
    this.formEditSslCert.name = this.form.get('certName').value;
    this.formEditSslCert.name = this.form.get('remarks').value;
    if(this.uploadMethod === '2'){
      this.formEditSslCert.certificate = this.form.get('certificate').value + this.caCertificate;
      this.formEditSslCert.privateKey = this.form.get('privateKey').value;
    }else{
      this.formEditSslCert.certificate = this.form.get('certificate').value;
      this.formEditSslCert.privateKey = this.form.get('privateKey').value;
    }
    return this.formEditSslCert;
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
  async handleEdit() {
    this.isLoading = true;
    this.formEditSslCert = await this.getData();
    this.SSLCertService.editSSlCert(this.id, this.formEditSslCert).subscribe(
      (data) => {
        this.isLoading = false;
        this.router.navigate(['/app-smart-cloud/waf/ssl-cert']);
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          'Chỉnh sửa ssl cert thành công'
        );
      },
      (error) => {
        this.isLoading = false;
         if (this.form.get('privateKey').value === '') {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('Private Key không hợp lệ')
          );
        }else if (this.form.get('certificate').value === '') {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('Certificate không hợp lệ')
          );
        }else{
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            'Chỉnh sửa ssl cert thất bại'
          );
        }
      }
    );
  }
}
