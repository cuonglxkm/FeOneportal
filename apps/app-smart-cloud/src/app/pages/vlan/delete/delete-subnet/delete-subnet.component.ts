import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-delete-subnet',
  templateUrl: './delete-subnet.component.html',
  styleUrls: ['./delete-subnet.component.less']
})
export class DeleteSubnetComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() id: number;
  @Input() nameSubnet: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisibleDeleteSubnet: boolean = false;
  isLoadingDeleteSubnet: boolean = false;

  value: string;
  isInput: boolean = false;
  @ViewChild('subnetInputName') subnetInputName!: ElementRef<HTMLInputElement>;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private vlanService: VlanService) {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOkDeleteSubnet();
    }
  }

  ngAfterViewInit(): void {
    this.subnetInputName?.nativeElement.focus();
  }

  onInputChange(value) {
    this.value = value;
  }

  showModalDeleteSubnet() {
    this.isVisibleDeleteSubnet = true;
    setTimeout(() => {
      this.subnetInputName?.nativeElement.focus();
    }, 1000);
  }

  handleCancelDeleteSubnet() {
    this.isVisibleDeleteSubnet = false;
    this.isLoadingDeleteSubnet = false;
    this.isInput = false;
    this.value = null;
    this.onCancel.emit();
  }

  handleOkDeleteSubnet() {
    this.isLoadingDeleteSubnet = true;
    if (this.value == this.nameSubnet) {
      this.isInput = false;
      this.isLoadingDeleteSubnet = true;
      this.vlanService.deleteSubnet(this.id).subscribe(item => {
        this.isVisibleDeleteSubnet = false;
        this.isLoadingDeleteSubnet = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.vlan.note53'));
        this.onOk.emit(item)
      }, error => {
        this.isVisibleDeleteSubnet = false;
        this.isLoadingDeleteSubnet = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.vlan.note54'), error.error.detail);
      });

    } else {
      this.isInput = true;
      this.isLoadingDeleteSubnet = false;
    }

  }
}
