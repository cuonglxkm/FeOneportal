import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FileSystemService } from '../../../../../shared/services/file-system.service';
import { FormDeleteFileSystem } from '../../../../../shared/models/file-system.model';

@Component({
  selector: 'one-portal-delete-file-system',
  templateUrl: './delete-file-system.component.html',
  styleUrls: ['./delete-file-system.component.less']
})
export class DeleteFileSystemComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() fileSystemId: number;
  @Input() fileSystemName: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isLoading: boolean = false;
  isVisible: boolean = false;

  value: string;
  isInput: boolean = false;

  @ViewChild('fileSystemInputName') fileSystemInputName!: ElementRef<HTMLInputElement>;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fileSystemService: FileSystemService) {
  }

  ngAfterViewInit(): void {
    this.fileSystemInputName?.nativeElement.focus();
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOk();
    }
  }

  onInput(value) {
    this.value = value;
  }

  showModal() {
    this.isVisible = true;
    setTimeout(() => {
      this.fileSystemInputName?.nativeElement.focus();
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
    if (this.value == this.fileSystemName) {
      this.isInput = false;
      let formDelete = new FormDeleteFileSystem();
      formDelete.id = this.fileSystemId;
      formDelete.regionId = this.region;
      this.fileSystemService.deleteFileSystem(formDelete).subscribe(data => {
        this.isVisible = false;
        this.isLoading = false;
        this.notification.success('Thành công', 'Xóa File System thành công');
        this.onOk.emit();
      }, error => {
        console.log('error', error);
        this.isVisible = false;
        this.isLoading = false;
        this.notification.error('Thất bại', 'Xóa File System thất bại');
      });
    } else {
      this.isInput = true;
      this.isLoading = false;
    }
  }
}
