import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import { data } from 'vis-network';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-detach-ip-floating-lb',
  templateUrl: './detach-ip-floating-lb.component.html',
  styleUrls: ['./detach-ip-floating-lb.component.less']
})
export class DetachIpFloatingLbComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() idLb: number;
  @Input() ipId: number;
  @Input() vipPortIp: string;
  @Input() IsFloatingIP: boolean;
  @Input() ipFloatingAddress: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;
  isInput: boolean = false;
  value: string;

  @ViewChild('ipFloatingAddressInput') ipFloatingAddressInput!: ElementRef<HTMLInputElement>;
  disableDelete = true;

  constructor(private loadBalancerService: LoadBalancerService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private router: Router,
              private notification: NzNotificationService) {
  }

  onInput(value) {
    if (this.ipFloatingAddress == value) {
      this.disableDelete = false;
      this.isInput = false;
    } else {
      this.disableDelete = true;
      this.isInput = true;
    }
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  showModal() {
    this.isVisible = true;
    setTimeout(() => {
      this.ipFloatingAddressInput?.nativeElement.focus();
    }, 1000);
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true;
    this.loadBalancerService.attachOrDetachIpFloating(this.ipId, this.idLb, this.region, this.project, null).pipe(finalize(() => {
      this.isLoading = false;
      this.isVisible = false;
      this.onCancel.emit();
    }))
      .pipe(finalize(()=> {this.onOk.emit();}))
      .subscribe(
      data => {
        this.notification.success(this.i18n.fanyi('app.status.success'), 'detach success');
      }, error => {
        this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.detail);
      }
    );
  }

  ngAfterViewInit() {
    this.ipFloatingAddressInput?.nativeElement.focus();
  }
}
