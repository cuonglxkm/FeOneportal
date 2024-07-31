import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';


@Component({
  selector: 'one-portal-http-setting',
  templateUrl: './http-setting.component.html',
  styleUrls: ['./http-setting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HttpSettingComponent {
  @Input() domainData: any ;

  isLoading: boolean = false;
  isVisibleCreateSsl: boolean = false
  isVisible: boolean = false

  constructor(
    private fb: NonNullableFormBuilder
  ){}

  openModal(){
    this.isVisible = true
  }

  handleCancelHttpSetting(){
    this.isVisible = false
  }

  openModalSSlCert(){
    this.isVisibleCreateSsl = true
  }

  cancelModalSslCert(){
    this.isVisibleCreateSsl = false
  }
}
