import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { AssociatedDomainDTO, SslCertDTO } from '../../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-disassociate-ssl-domain',
  templateUrl: './disassociate-ssl-domain.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisassociateSslDomainComponent {
  @Input() sslCertData: SslCertDTO
  @Input() domainData: AssociatedDomainDTO
  @Input() isVisible: boolean 
  @Output() onCancelVisible = new EventEmitter()
  @Output() onOk = new EventEmitter()

  // isVisible: boolean = false;
  isLoading: boolean = false;


  constructor(private cdr: ChangeDetectorRef, private wafService: WafService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ){}

  openModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.onCancelVisible.emit()
  }

  handleOk(){
    this.isLoading = true
    this.wafService.disAssociateCertificate(this.sslCertData.id, this.domainData.id).subscribe({
      next:()=>{
        this.isLoading = false;
        this.notification.success(this.i18n.fanyi("app.status.success"), "Disassociate certificate successfully")
        this.onOk.emit()
      },
      error:()=>{
        this.notification.error(this.i18n.fanyi("app.status.error"), "Error occured")
        this.isLoading = false
      }
    })
  }
}
