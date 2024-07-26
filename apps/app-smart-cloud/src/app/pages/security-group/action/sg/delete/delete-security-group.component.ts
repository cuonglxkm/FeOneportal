import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SecurityGroupService } from '../../../../../shared/services/security-group.service';
import { FormDeleteSG } from '../../../../../shared/models/security-group';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-delete-security-group',
  templateUrl: './delete-security-group.component.html',
  styleUrls: ['./delete-security-group.component.less']
})
export class DeleteSecurityGroupComponent implements AfterViewInit{
  @Input() idSG: string;
  @Input() nameSG: string;
  @Input() region: number;
  @Input() project: number;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onOk = new EventEmitter<void>();

  isVisible: boolean = false;
  isLoading = false;

  isInput: boolean = false;

  value: string;

  @ViewChild('sgInputName') sgInputName!: ElementRef<HTMLInputElement>;

  constructor(
    private securityGroupService: SecurityGroupService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService) {}

  ngAfterViewInit(): void {
    this.sgInputName?.nativeElement.focus()
    }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }
  onChangeInput(value) {
    this.value = value
  }
  showModal(): void {
    this.isVisible = true;
    console.log(this.idSG)
    console.log(this.nameSG)
    setTimeout(() => {this.sgInputName?.nativeElement.focus()}, 1000)
  }

  handleCancel(): void {
    this.isVisible = false;
    this.isInput = false
    this.value = null
    this.onCancel.emit()
  }


  handleOk(): void {
    this.isLoading = true;
    if(this.value?.includes(this.nameSG)) {
      this.isInput = false;
      let formDeleteSG = new FormDeleteSG()
      formDeleteSG.id = this.idSG
      formDeleteSG.userId = this.tokenService.get()?.userId
      formDeleteSG.regionId = this.region
      formDeleteSG.projectId = this.project


      this.securityGroupService.deleteSG(formDeleteSG).subscribe((data) => {
          this.isLoading = false;
          this.isVisible = false;
          this.isInput = false
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('sg.notification.remove.success'));
          this.onOk.emit();
          this.value = null
        }, error => {
          this.isInput = false
          this.isVisible = false;
          this.isLoading = false;
          this.value = null
          console.log('error', error)
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('sg.notification.remove.fail') + '. ' + error.error.message);
        })
    } else {
      this.isInput = true
      this.isLoading = false
    }
  }
}
