import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-delete-l7-rule',
  templateUrl: './delete-l7-rule.component.html',
  styleUrls: ['./delete-l7-rule.component.less']
})
export class DeleteL7RuleComponent{
  @Input() idL7Rule: string;
  @Input() idL7Policy: string;
  @Input() region: number;
  @Input() project: number;
  @Input() nameRule: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  isInput: boolean = false;
  value: string;


  constructor(private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private loadBalancerService: LoadBalancerService,
              private notification: NzNotificationService) {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }
  showModal() {
    this.isVisible = true
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true;
    this.loadBalancerService.deleteL7Rule(this.idL7Rule, this.idL7Policy, this.region, this.project).subscribe(data => {
      if (data) {
        this.isLoading = false;
        this.isVisible = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.request.delete.L7.rule.success'));

      } else {
        console.log('data', data);
        this.isLoading = false;
        this.isVisible = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.request.delete.L7.rule.fail'));
      }
      setTimeout(() => {
        this.onOk.emit(data);
      }, 500);
    }, error => {
      console.log('error', error);
      this.isLoading = false;
      this.isVisible = false;
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.request.delete.L7.rule.fail'));
    });
  }
}
