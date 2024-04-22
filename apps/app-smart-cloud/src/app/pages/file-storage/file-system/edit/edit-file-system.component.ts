import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {
  FileSystemDetail,
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
  @Input() fileSystemId: number;
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

  fileSystem: FileSystemDetail = new FileSystemDetail();
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
      data?.records?.forEach(item => {
        this.nameList?.push(item?.name);

        this.nameList = this.nameList?.filter(item => item !== this.validateForm.get('nameFileSystem').value);
      });
      console.log(this.nameList);
    });
  }

  showModal() {
    this.isVisible = true;
    this.getFileSystemById();
    this.getListFileSystem();
    setTimeout(() => {
      this.fileSystemInputName?.nativeElement.focus();
    }, 1000);
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  getFileSystemById() {
    this.isLoading = true;
    this.fileSystemService.getFileSystemById(this.fileSystemId, this.region).subscribe(data => {
      this.fileSystem = data;
      this.validateForm.controls.nameFileSystem.setValue(data.name);
      this.validateForm.controls.description.setValue(data.description);
      this.isLoading = false;
    }, error => {
      this.fileSystem = null;
      this.isLoading = false;
    });
  }

  handleOk() {
    this.isLoading = true;
    let formEdit = new FormEditFileSystem();
    formEdit.id = this.fileSystemId;
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
