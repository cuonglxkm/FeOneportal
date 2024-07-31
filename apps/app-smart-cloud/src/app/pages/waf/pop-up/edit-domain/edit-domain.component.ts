import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ipValidatorMany } from '../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-edit-domain',
  templateUrl: './edit-domain.component.html',
  styleUrls: ['./edit-domain.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDomainComponent {
  @Input() domainData: any 

  isVisible: boolean = false;
  isLoading: boolean = false;

  validateForm: FormGroup<{
    ipPublic: FormControl<string>;
    host: FormControl<string>;
    port: FormControl<string>
  }> = this.fb.group({
    ipPublic: ['', [Validators.required, ipValidatorMany]],
    host:[''],
    port:['']
  });

  constructor(private fb: NonNullableFormBuilder){}

  openModal(){
    this.isVisible = true
  }

  handleCancelEditDomain(){
    this.isVisible = false
  }
}
