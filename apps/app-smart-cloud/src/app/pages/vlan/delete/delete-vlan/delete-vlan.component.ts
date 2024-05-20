import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { VlanService } from '../../../../shared/services/vlan.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-delete-vlan',
  templateUrl: './delete-vlan.component.html',
  styleUrls: ['./delete-vlan.component.less']
})
export class DeleteVlanComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() id: number;
  @Input() nameNetwork: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisibleDelete: boolean = false;
  isLoadingDelete: boolean = false;

  value: string;

  isInput: boolean = false;
  isInputNull: boolean = false;
  @ViewChild('vlanNetworkInputName') vlanNetworkInputName!: ElementRef<HTMLInputElement>;

  constructor(private vlanService: VlanService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notification: NzNotificationService) {
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOkDelete();
    }
  }

  ngAfterViewInit(): void {
    this.vlanNetworkInputName?.nativeElement.focus()
  }

  onInput(value) {
    this.value = value;
  }

  showModalDelete() {
    this.isVisibleDelete = true;
    setTimeout(() => {
      this.vlanNetworkInputName?.nativeElement.focus();
    }, 1000);
  }

  handleCancelDelete() {
    this.isVisibleDelete = false
    this.isLoadingDelete = false
    this.isInput = false
    this.value = null
    this.onCancel.emit()
  }

  handleOkDelete() {
    this.isLoadingDelete = true
    if (this.value == this.nameNetwork) {
      this.isInputNull = false
      this.isInput = false
      this.vlanService.deleteNetwork(this.id).subscribe(data => {
        this.isLoadingDelete = false
        this.isVisibleDelete = false
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.vlan.note55'));
        this.value = null
        this.onOk.emit(data)
      }, error => {
        this.isLoadingDelete = false
        this.isVisibleDelete = false
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.vlan.note56'), error.error.detail)
        this.value = null
        this.onOk.emit()
      })
    } else {
      if(this.value == undefined) {
        this.isInput = false
        this.isInputNull = true
        this.isLoadingDelete = false
      } else {
        this.isInputNull = false
        this.isInput = true
        this.isLoadingDelete = false
      }


    }
  }
}
