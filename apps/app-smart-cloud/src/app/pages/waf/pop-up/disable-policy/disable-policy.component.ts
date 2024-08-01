import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'one-portal-disable-policy',
  templateUrl: './disable-policy.component.html',
  styleUrls: ['./disable-policy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisablePolicyComponent {
  @Input() domainData: any

  isVisible: boolean = false;

  openModal(){
    this.isVisible = true
  }

  handleCancelDisablePolicyModal(){
    this.isVisible = false
  }
}
