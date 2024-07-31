import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'one-portal-delete-ssl-btn',
  templateUrl: './delete-ssl-btn.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteSslBtnComponent {
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
