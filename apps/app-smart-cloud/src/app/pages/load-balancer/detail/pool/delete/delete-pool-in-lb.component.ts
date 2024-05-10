import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-delete-pool-in-lb',
  templateUrl: './delete-pool-in-lb.component.html',
  styleUrls: ['./delete-pool-in-lb.component.less'],
})
export class DeletePoolInLbComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() poolId: string;
  @Input() loadBalancerId: number;
  @Input() listenerId: string;
  @Input() namePool: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  value: string;

  isInput: boolean = false;

  @ViewChild('poolInputName') poolInputName!: ElementRef<HTMLInputElement>;

  constructor(
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private loadBalancerService: LoadBalancerService
  ) {}

  onInput(value) {
    this.value = value;
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
      this.poolInputName?.nativeElement.focus();
    }, 1000);
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.isInput = false;
    this.value = null;
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true;
    if (this.value == this.namePool) {
      this.isInput = false;
      this.loadBalancerService
        .deletePool(this.poolId, this.region, this.project)
        .subscribe({
          next: (data) => {
            this.isLoading = false;
            this.isVisible = false;
            this.notification.success(
              '',
              this.i18n.fanyi('app.notification.delete.pool.success')
            );
            this.onOk.emit(data);
          },
          error: (error) => {
            console.log('error', error);
            this.isLoading = false;
            this.isVisible = false;
            this.notification.error(
              error.error.detail,
              this.i18n.fanyi('app.notification.delete.pool.fail')
            );
          },
        });
    } else {
      this.isInput = true;
      this.isLoading = false;
    }
  }
  ngAfterViewInit() {
    this.poolInputName?.nativeElement.focus();
  }
}
