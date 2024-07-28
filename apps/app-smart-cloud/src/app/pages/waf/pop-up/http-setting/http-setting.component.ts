import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';

@Component({
  selector: 'one-portal-http-setting',
  templateUrl: './http-setting.component.html',
  styleUrls: ['./http-setting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HttpSettingComponent {
  @Input() domainName: string = '';
  @Input() isVisibleHttpSetting: boolean;
  @Output() onCancelVisible = new EventEmitter();

  isLoading: boolean = false;
  isVisibleCreateSsl: boolean = false

  constructor(
    private fb: NonNullableFormBuilder
  ){}

  handleCancelHttpSetting(){
    this.onCancelVisible.emit(false)
  }

  openModalSSlCert(){
    this.isVisibleCreateSsl = true
  }

  cancelModalSslCert(){
    this.isVisibleCreateSsl = false
  }
}
