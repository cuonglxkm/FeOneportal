import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NAME_SNAPSHOT_REGEX } from 'src/app/shared/constants/constants';
import { WafDomainDTO } from '../../domain-list/domain-list.component';

@Component({
  selector: 'one-portal-delete-domain',
  templateUrl: './delete-domain.component.html',
  styleUrls: ['./delete-domain.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDomainComponent {
  @Input() domainData: WafDomainDTO

  isVisible: boolean = false;
  isLoading: boolean = false;
  inputConfirm: string = ''
  checkInputEmpty: boolean = false;
  checkInputConfirm: boolean = false;

  validateForm: FormGroup<{
    name: FormControl<string>; 
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_SNAPSHOT_REGEX)]],
  });

  constructor(private fb: NonNullableFormBuilder, private cdr: ChangeDetectorRef){}

  openModal(){
    this.isVisible = true
  }

  onInputChange(value: string){
    this.inputConfirm = value
  }

  handleCancelDeleteDomain(){
    this.inputConfirm = '';
    this.checkInputConfirm = false;
    this.checkInputEmpty = false;
    this.isVisible = false
  }

  handleOkDelete(){
    if (this.inputConfirm == this.domainData.domain) {
      console.log('successfully')
    } else if (this.inputConfirm == '') {
      this.checkInputEmpty = true;
      this.checkInputConfirm = false;
    } else {
      this.checkInputEmpty = false;
      this.checkInputConfirm = true;
    }
    this.cdr.detectChanges();
  }
}
