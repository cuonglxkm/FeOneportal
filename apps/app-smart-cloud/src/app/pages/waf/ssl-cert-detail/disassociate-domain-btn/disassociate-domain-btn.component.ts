import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AssociatedDomainDTO, SslCertDTO } from '../../waf.model';

@Component({
  selector: 'one-portal-disassociate-domain-btn',
  templateUrl: './disassociate-domain-btn.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisassociateDomainBtnComponent {
  @Input() sslCertData: SslCertDTO;
  @Input() domainData: AssociatedDomainDTO;
  @Output() onOk = new EventEmitter()

  isVisible: boolean = false;
  openModal(){
    return this.isVisible = true;
  }

  handleCancel(){
    this.isVisible = false
  }

  handleOnOk(){
    this.onOk.emit()
  }
}
