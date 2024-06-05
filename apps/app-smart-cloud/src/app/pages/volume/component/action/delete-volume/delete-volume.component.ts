import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-delete-volume',
  templateUrl: './delete-volume.component.html',
  styleUrls: ['./delete-volume.component.less']
})



export class DeleteVolumeComponent implements AfterViewInit{
  @Input() region: number;
  @Input() project: number;
  @Input() volumeId: number;
  @Input() volumeName: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  @ViewChild('volumeInputName') volumeInputName!: ElementRef<HTMLInputElement>;


  isLoading: boolean = false;
  isVisible: boolean = false;

  value: string;
  isInput: boolean = false;


  constructor(private notification: NzNotificationService,
              private volumeService: VolumeService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }
  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  showModal() {
    this.isVisible = true;
    setTimeout(() => {this.volumeInputName?.nativeElement.focus()}, 1000)
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.isInput = false;
    this.value = null;
    this.onCancel.emit();
  }

  onInputChange(value) {
    this.value = value;
  }

  handleOk() {
    this.isLoading = true;
    if (this.value == this.volumeName) {
      this.isInput = false;
      this.volumeService.deleteVolume(this.volumeId).subscribe(data => {
          this.isLoading = false;
          this.isVisible = false;
          this.notification.success(this.i18n.fanyi('app.status.success'), 'Yêu cầu xóa volume đã được gửi đi thành công');
          this.onOk.emit(data);
      }, error => {
        console.log('error', error);
        this.isLoading = false;
        this.isVisible = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), 'Yêu cầu xóa volume gửi đi thất bại' + error.error.detail);
      });
    } else {
      this.isInput = true;
      this.isLoading = false;
    }
  }

  ngAfterViewInit() {
    this.volumeInputName?.nativeElement.focus();
  }

}


