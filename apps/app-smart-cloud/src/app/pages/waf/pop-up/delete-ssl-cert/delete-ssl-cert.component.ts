import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { SslCertDTO } from '../../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-delete-ssl-cert',
  templateUrl: './delete-ssl-cert.component.html',
  styleUrls: ['./delete-ssl-cert.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteSslCertComponent {
  @Input() sslCertData: SslCertDTO
  @Input() isVisible: boolean 
  @Output() onCancelVisible = new EventEmitter()
  @Output() onOk = new EventEmitter()

  isLoading: boolean = false;
  inputConfirm: string = ''
  checkInputEmpty: boolean = false;
  checkInputConfirm: boolean = false;


  constructor(private cdr: ChangeDetectorRef,
    private wafService: WafService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private router: Router,
    private notification: NzNotificationService,
  ){}

  onInputChange(value: string){
    this.inputConfirm = value
  }

  handleCancel(){
    this.inputConfirm = '';
    this.checkInputConfirm = false;
    this.checkInputEmpty = false;
    this.onCancelVisible.emit()
  }

  handleOk(){
    if (this.inputConfirm == this.sslCertData.name) {
      this.isLoading = true;
      this.wafService.deleteSslCert(this.sslCertData.id).pipe(finalize(()=>{
        this.isLoading = false
      })).subscribe({
        next:()=>{
          this.notification.success(this.i18n.fanyi("app.status.success"), "Xóa SSL Cert thành công")
          this.isVisible = false;
          this.onOk.emit()
        },
        error:()=>{
          this.notification.success(this.i18n.fanyi("app.status.error"), "Đã xảy ra lỗi")
        }
      })
    } else if (this.inputConfirm == '') {
      this.checkInputEmpty = true;
      this.checkInputConfirm = false;
    } else {
      this.checkInputEmpty = false;
      this.checkInputConfirm = true;
    }
    this.cdr.detectChanges();
  }
}
