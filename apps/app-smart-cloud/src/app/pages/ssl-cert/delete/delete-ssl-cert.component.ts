import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormDeleteFileSystemSnapshot } from 'src/app/shared/models/filesystem-snapshot';
import { FormDeleteSslCert } from 'src/app/shared/models/ssl-cert.model';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { SSLCertService } from 'src/app/shared/services/ssl-cert.service';


@Component({
  selector: 'one-portal-delete-ssl-cert',
  templateUrl: './delete-ssl-cert.component.html',
  styleUrls: ['./delete-ssl-cert.component.less'],
})
export class DeleteSslCertComponent{
  @Input() region; number
  @Input() project: number
  @Input() sslCertId: string
  @Input() sslCertName: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    name: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, this.nameSslCertValidator.bind(this)]]
  });

  nameSslCertValidator(control: FormControl): { [key: string]: any } | null {
    const name = control.value;
    if (name !== this.sslCertName) {
      return { 'nameMismatch': true };
    }
    return null;
  }

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private SSLCertService: SSLCertService) {
  }

  showModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
    this.validateForm.reset()
  }

  handleOk() {
    this.isLoading = true
    let formDelete = new FormDeleteSslCert()
    formDelete.uuid = this.sslCertId.split('/').pop()
    formDelete.projectId = this.project;
    formDelete.regionId = this.region
    console.log(formDelete);
    
    if(this.validateForm.valid) {
      if(this.sslCertName.includes(this.validateForm.controls.name.value)){
        this.SSLCertService.delete(formDelete).subscribe(data => {
          if(data) {
            this.isVisible = false
            this.isLoading =  false
            this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notify.sslcert.delete.success'))
            this.validateForm.reset()
            this.onOk.emit(data)
          }
        }, error => {
          this.isVisible = false
          this.isLoading =  false
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notify.sslcert.delete.fail'))
        })
      }
    }
  }

  
}
