import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'one-portal-associate-ssl-btn',
  templateUrl: './associate-ssl-btn.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssociateSslBtnComponent {
  @Input() sslCertData: any

  isVisible: boolean = false;
  isLoading: boolean = false;

  openModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
  }
}
