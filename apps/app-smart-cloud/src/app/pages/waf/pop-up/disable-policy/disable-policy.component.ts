import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WafDomainDTO } from '../../domain-list/domain-list.component';

@Component({
  selector: 'one-portal-disable-policy',
  templateUrl: './disable-policy.component.html',
  styleUrls: ['./disable-policy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisablePolicyComponent {
  @Input() domainData: WafDomainDTO

  isVisible: boolean = false;

  openModal(){
    this.isVisible = true
  }

  handleCancelDisablePolicyModal(){
    this.isVisible = false
  }
}
