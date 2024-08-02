import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SslCertDTO } from 'src/app/pages/waf/waf.model';

@Component({
  selector: 'one-portal-delete-ssl-btn',
  templateUrl: './delete-ssl-btn.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteSslBtnComponent {
  @Input() sslCertData: SslCertDTO

  isVisible: boolean = false;
  isLoading: boolean = false;

  openModal(){
    this.isVisible = true
  }

  handleCancel(){
    this.isVisible = false
  }
}
