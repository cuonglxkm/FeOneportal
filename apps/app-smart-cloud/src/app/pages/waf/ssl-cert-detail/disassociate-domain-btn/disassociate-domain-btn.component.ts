import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'one-portal-disassociate-domain-btn',
  templateUrl: './disassociate-domain-btn.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisassociateDomainBtnComponent {
  @Input() sslCertData: any;
  @Input() domainData: any;

  isVisible: boolean = false;
  openModal(){
    this.isVisible = true;
  }

  handleCancel(){
    this.isVisible = false
  }
}
