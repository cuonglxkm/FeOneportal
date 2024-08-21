import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormEditFileSystemSnapShot } from 'src/app/shared/models/filesystem-snapshot';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { FileSystemDetail } from 'src/app/shared/models/file-system.model';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NAME_CERT_REGEX, NAME_REGEX, NAME_SNAPSHOT_REGEX } from 'src/app/shared/constants/constants';
import { fileValidator } from '../../../../../../../../libs/common-utils/src';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { SslCertRequest } from '../../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';

@Component({
  selector: 'one-portal-create-ssl-cert',
  templateUrl: './create-ssl-cert.component.html',
  styleUrls: ['./create-ssl-cert.component.less'],
})
export class CreateSSLCertPopupComponent {
  @Input() isVisibleCreateSSLCert: boolean;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onCancelVisible = new EventEmitter();
  isVisible: boolean = false;
  isLoading: boolean = false;
  value: string;
  isCheckBegin: boolean = false;
  customerId: number;
  selectedFileSystemName: string;
  fileList: NzUploadFile[] = [];
  formCreateeSslCert: SslCertRequest = new SslCertRequest();
  caCertificate: string = '';
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
    certName: ['', [Validators.required, Validators.pattern(NAME_CERT_REGEX)]],
    certificate: ['', Validators.required],
    remarks: ['']
  });


  constructor(
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private SSLCertService: WafService
  ) {}

  handleCancelCreateSSLCert(){
    this.form.reset()
    this.fileList = []
    this.onCancelVisible.emit(false)
  }

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
        } else if (fileExtension === 'pem') {
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
    this.formCreateeSslCert.name = this.form.get('certName').value;
    this.formCreateeSslCert.remarks = this.form.get('remarks').value;
    if(this.uploadMethod === '2'){
      this.formCreateeSslCert.certificate = this.form.get('certificate').value + this.caCertificate;
      this.formCreateeSslCert.privateKey = this.form.get('privateKey').value;
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
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          'Tạo mới ssl cert thành công'
        );
        this.form.reset()
        this.fileList = []
        this.onOk.emit(data);
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
        }else if (error.error.detail.includes('Error parameter')) {
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('File không hợp lệ')
          );
        }else if (this.form.get('privateKey').value === '') {
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
            this.i18n.fanyi('app.status.fail'), 'Tạo mới ssl cert thất bại');
        }
      }
    );
  }
}
