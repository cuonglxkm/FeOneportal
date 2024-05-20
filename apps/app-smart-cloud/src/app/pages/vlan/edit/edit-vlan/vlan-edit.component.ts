import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AppValidator } from '../../../../../../../../libs/common-utils/src';
import { VlanService } from '../../../../shared/services/vlan.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormSearchNetwork } from '../../../../shared/models/vlan.model';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-vlan-edit',
  templateUrl: './vlan-edit.component.html',
  styleUrls: ['./vlan-edit.component.less']
})
export class VlanEditComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() id: number;
  @Input() nameNetwork: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisibleEditVlan: boolean = false;
  isLoadingEditVlan: boolean = false;

  validateForm: FormGroup<{
    nameNetwork: FormControl<string>
  }> = this.fb.group({
    nameNetwork: ['vlan_', [Validators.required,
      AppValidator.startsWithValidator('vlan_'),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      this.duplicateNameValidator.bind(this),
      this.prefixValidator()]]
  });

  nameList: string[] = [];

  @ViewChild('vlanNetworkInputName') vlanNetworkInputName!: ElementRef<HTMLInputElement>;

  constructor(private vlanService: VlanService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fb: NonNullableFormBuilder) {

    const nameNetworkInput = document.querySelector('input[formControlName="nameNetwork"]');
    if (nameNetworkInput) {
      nameNetworkInput.addEventListener('keydown', (event: KeyboardEvent) => {
        const currentValue = this.validateForm.get('nameNetwork').value;
        const cursorPosition = (event.target as HTMLInputElement).selectionStart;

        // Ngăn việc xóa các ký tự trong 'vlan_'
        if (event.key === 'Backspace' && cursorPosition <= 5) {
          event.preventDefault();
        } else if (event.key === 'Delete' && cursorPosition < 5) {
          event.preventDefault();
        }
      });
    }

    this.validateForm.get('nameNetwork').valueChanges.subscribe(value => {
      console.log('change value', value)
      if(value == '') this.validateForm.controls.nameNetwork.setValue('vlan_')
      if (value !== null && value !== undefined && value !== '') {
        if (!value.startsWith('vlan_')) {
          // Nếu giá trị không bắt đầu bằng 'vlan_', đặt lại giá trị 'vlan_'
          this.validateForm.get('nameNetwork').setValue('vlan_', { emitEvent: false });
        }
      }
    })
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

  prefixValidator(): Validators {
    return (control: FormControl): { [key: string]: any } | null => {
      const isValid = control.value.startsWith('vlan_') && control.value.length > 5;
      return isValid ? null : { prefixError: true };
    };
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleOkEditVlan();
    }
  }

  ngAfterViewInit(): void {
    this.vlanNetworkInputName?.nativeElement.focus();
  }

  showModalEditVlan() {
    this.isVisibleEditVlan = true;
    this.getListVlan()
    this.validateForm.controls.nameNetwork.setValue(this.nameNetwork);
    setTimeout(() => {
      this.vlanNetworkInputName?.nativeElement.focus();
    }, 1000);
  }

  getListVlan() {
    let formSearch = new FormSearchNetwork()
    formSearch.project = this.project
    formSearch.region = this.region
    formSearch.pageNumber = 1
    formSearch.pageSize = 9999
    formSearch.vlanName = null
    formSearch.networktAddress = null
    this.vlanService.getVlanNetworks(formSearch).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item.name)

        this.nameList = this.nameList.filter(item => item !==  this.validateForm.get('nameNetwork').getRawValue())
      })
    })
  }

  handleCancelEditVlan() {
    this.isVisibleEditVlan = false;
    this.isLoadingEditVlan = false;
    this.onCancel.emit();
  }

  handleOkEditVlan() {
    if (this.validateForm.valid) {
      this.isLoadingEditVlan = true;
      this.vlanService.updateNetwork(this.id, this.validateForm.controls.nameNetwork.value).subscribe(data => {
          this.isLoadingEditVlan = false;
          this.isVisibleEditVlan = false;
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.vlan.note47'));
          this.validateForm.reset();
          this.onOk.emit(data);

      }, error => {
        this.isLoadingEditVlan = false;
        this.isVisibleEditVlan = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.vlan.note48'));
        this.validateForm.reset();
      });
    }
  }
}
