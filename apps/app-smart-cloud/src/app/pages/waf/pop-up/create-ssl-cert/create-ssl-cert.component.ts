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
import { NAME_SNAPSHOT_REGEX } from 'src/app/shared/constants/constants';
import { fileValidator } from '../../../../../../../../libs/common-utils/src';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';

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

  validateForm: FormGroup<{
    name: FormControl<string>; 
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_SNAPSHOT_REGEX)]],
  });

  constructor(
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fileSystemSnapshotService: FileSystemSnapshotService
  ) {}

  handleCancelCreateSSLCert(){
    this.onCancelVisible.emit(false)
  }

  ngOnInit(): void {
    
  }

  fileList: NzUploadFile[] = [];

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
}
