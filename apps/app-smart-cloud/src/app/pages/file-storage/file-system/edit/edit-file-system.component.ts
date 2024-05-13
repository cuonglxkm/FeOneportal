import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {
  FileSystemDetail, FileSystemModel,
  FormEditFileSystem,
  FormSearchFileSystem
} from '../../../../shared/models/file-system.model';
import { FileSystemService } from '../../../../shared/services/file-system.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-edit-file-system',
  templateUrl: './edit-file-system.component.html',
  styleUrls: ['./edit-file-system.component.less']
})
export class EditFileSystemComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() fileSystem: FileSystemModel;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isLoading: boolean = false;
  isVisible: boolean = false;
  isLoadingUpdate: boolean = false;

  validateForm: FormGroup<{
    nameFileSystem: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameFileSystem: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9-_ ]+$/),
      Validators.maxLength(50), this.duplicateNameValidator.bind(this)]],
    description: [null as string, [Validators.maxLength(255)]]
  });

  // fileSystem: FileSystemDetail = new FileSystemDetail();
  nameList: string[] = [];

  @ViewChild('fileSystemInputName') fileSystemInputName!: ElementRef<HTMLInputElement>;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private fb: NonNullableFormBuilder,
              private fileSystemService: FileSystemService,
              private notification: NzNotificationService,
              private router: Router) {
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

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
  }

  getListFileSystem() {
    let formSearch = new FormSearchFileSystem();
    formSearch.vpcId = this.project;
    formSearch.regionId = this.region;
    formSearch.name = null;
    formSearch.currentPage = 1;
    formSearch.pageSize = 9999;
    formSearch.isCheckState = true;
    this.fileSystemService.search(formSearch).subscribe(data => {
        data.records.forEach((item) => {
          if (this.nameList.length > 0) {
            this.nameList.push(item.name);
          } else {
            this.nameList = [item.name];
          }
        });
        this.nameList.forEach(item => {
          const index = this.nameList.indexOf(this.validateForm.controls.nameFileSystem.value);
          // Nếu giá trị có tồn tại trong mảng, loại bỏ nó
          if (index !== -1) {
            this.nameList.splice(index, 1);
          }
        });
      },
      (error) => {
        this.nameList = null;
      });
  }

  showModal() {
    this.isVisible = true;

    this.getListFileSystem();
    this.validateForm.controls.nameFileSystem.setValue(this.fileSystem?.name);
    this.validateForm.controls.description.setValue(this.fileSystem?.description);
    setTimeout(() => {
      this.fileSystemInputName?.nativeElement.focus();
    }, 1000);
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true;
    console.log(this.validateForm.getRawValue())
    let formEdit = new FormEditFileSystem();
    formEdit.id = this.fileSystem?.id;
    formEdit.regionId = this.region;
    formEdit.customerId = this.tokenService.get()?.userId;
    formEdit.name = this.validateForm.controls.nameFileSystem.value;
    formEdit.description = this.validateForm.controls.description.value;
    this.fileSystemService.edit(formEdit).subscribe(data => {
      this.isLoading = false;
      this.isVisible = false;
      this.notification.success('Thành công', 'Cập nhật File System thành công');

      this.onOk.emit(data);
    }, error => {
      this.isLoading = false;
      this.isVisible = false;
      this.notification.error('Thất bại', 'Cập nhật File System thất bại');
    });
  }
}
