import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { SecurityGroupSearchCondition } from '../../../shared/models/security-group';
import { AppValidator } from '../../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SecurityGroupService } from '../../../shared/services/security-group.service';
import { FormEditFileSystemSnapShot } from 'src/app/shared/models/filesystem-snapshot';
import { FileSystemSnapshotService } from 'src/app/shared/services/filesystem-snapshot.service';
import { FileSystemDetail } from 'src/app/shared/models/file-system.model';
import { FileSystemService } from 'src/app/shared/services/file-system.service';

@Component({
  selector: 'one-portal-edit-file-system-snapshot',
  templateUrl: './edit-file-system-snapshot.component.html',
  styleUrls: ['./edit-file-system-snapshot.component.less'],
})
export class EditFileSystemSnapshotComponent {
  @Input() filesystemsnapshotId: number;
  @Input() data: any;
  @Input() region: number;
  @Input() project: number;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  formEditFileSystemSnapshot: FormEditFileSystemSnapShot =
    new FormEditFileSystemSnapShot();
  fileSystemSnapshotDetail: any;
  fileSystem: FileSystemDetail = new FileSystemDetail();

  validateForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^(?! *$)[a-zA-Z0-9-_ ]{1,255}/)]],
    description: [''],
  });

  constructor(
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    private fileSystemSnapshotService: FileSystemSnapshotService
  ) {}

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset();
    this.onCancel.emit();
  }

  getData(): FormEditFileSystemSnapShot {
    this.formEditFileSystemSnapshot.customerId =
      this.tokenService.get()?.userId;
    this.formEditFileSystemSnapshot.regionId = this.region;
    this.formEditFileSystemSnapshot.vpcId = this.project;
    this.formEditFileSystemSnapshot.name =
      this.validateForm.controls.name.value;
    this.formEditFileSystemSnapshot.description =
      this.validateForm.controls.description.value;
    this.formEditFileSystemSnapshot.id = this.filesystemsnapshotId;
    return this.formEditFileSystemSnapshot;
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.isLoading = true;
      this.formEditFileSystemSnapshot = this.getData();
      console.log(this.formEditFileSystemSnapshot);

      this.fileSystemSnapshotService
        .edit(this.formEditFileSystemSnapshot)
        .subscribe(
          (data) => {
            this.notification.success(
              'Thành công',
              'Cập nhật File System Snapshot thành công'
            );
            this.isVisible = false;
            this.isLoading = false;
            this.onOk.emit(data);
          },
          (error) => {
            this.isLoading = false;
            this.notification.error(
              'Thất bại',
              'Cập nhật File System Snapshot thất bại'
            );
          }
        );
    }
  }

  ngOnInit(): void {
    this.validateForm.controls.name.setValue(this.data.name);
    this.validateForm.controls.description.setValue(this.data.description);
  }
}
