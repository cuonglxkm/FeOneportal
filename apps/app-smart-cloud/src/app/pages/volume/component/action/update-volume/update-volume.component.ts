import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { VolumeDTO } from '../../../../../shared/dto/volume.dto';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { EditTextVolumeModel } from '../../../../../shared/models/volume.model';

@Component({
  selector: 'one-portal-update-volume',
  templateUrl: './update-volume.component.html',
  styleUrls: ['./update-volume.component.less'],
})
export class UpdateVolumeComponent implements AfterViewInit{
  @Input() region: number
  @Input() project: number
  @Input() volume: VolumeDTO
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isLoading: boolean = false
  isVisible: boolean = false
  isLoadingUpdate: boolean = false

  validateForm: FormGroup<{
    nameVolume: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameVolume: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      Validators.maxLength(70),
    this.duplicateNameValidator.bind(this)]],
    description: [null as string, [Validators.maxLength(255)]]
  });

  @ViewChild('volumeInputName') volumeInputName!: ElementRef<HTMLInputElement>;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private volumeService: VolumeService,
              private fb: NonNullableFormBuilder) {
  }

  // ngAfterViewChecked(): void {
  //   this.firstInput?.nativeElement.focus();
  //   }

  nameList: string[] = [];

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

  getListVolumes() {
    this.volumeService.getVolumes(this.tokenService.get()?.userId, this.project, this.region,9999,1,null,null)
      .subscribe((data) => {
        data.records.forEach((item) => {
            if (this.nameList.length > 0) {
              this.nameList.push(item.name);
            } else {
              this.nameList = [item.name];
            }
          });
          this.nameList = this.nameList.filter(item => item !== this.validateForm.get('nameVolume').getRawValue());
        },
        (error) => {
          this.nameList = null;
        }
      );
  }

  showModal() {
    this.isVisible = true;
    this.getListVolumes();
    this.validateForm.get('nameVolume').setValue(this.volume.name);
    console.log('name list', this.nameList);

    this.validateForm.get('description').setValue(this.volume.description);

    setTimeout(() => {this.volumeInputName?.nativeElement.focus()}, 1000)
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoadingUpdate = false;
    this.onCancel.emit();
  }

  handleOk() {
    let request: EditTextVolumeModel = new EditTextVolumeModel();
    request.customerId = this.tokenService.get()?.userId;
    request.volumeId = this.volume.id;
    request.newName = this.validateForm.controls.nameVolume.value;
    request.newDescription = this.validateForm.controls.description.value;
    this.isLoadingUpdate = true;
    this.volumeService.updateVolume(request).subscribe(data => {
      if (data) {
        this.isLoadingUpdate = false;
        this.isVisible = false;
        this.notification.success('Thành công', 'Cập nhật thông tin Volume thành công');
        this.onOk.emit();
      }
    }, error => {
      this.isLoadingUpdate = false;
      this.isVisible = false;
      this.notification.error('Thất bại', 'Cập nhật thông tin Volume thất bại');
    });
    this.isVisible = false;
  }

  ngAfterViewInit() {
    this.volumeInputName?.nativeElement.focus();
  }
}
