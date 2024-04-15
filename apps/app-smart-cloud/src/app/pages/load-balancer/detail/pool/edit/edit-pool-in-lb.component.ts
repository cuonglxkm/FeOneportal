import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Pool } from '../../../../../shared/models/load-balancer.model';

@Component({
  selector: 'one-portal-edit-pool-in-lb',
  templateUrl: './edit-pool-in-lb.component.html',
  styleUrls: ['./edit-pool-in-lb.component.less'],
})
export class EditPoolInLbComponent implements AfterViewInit{
  @Input() region: number
  @Input() project: number
  @Input() poolId: string
  @Input() loadBlancerId: number
  @Input() listenerId: string
  @Output() onOk = new EventEmitter()
  @Output() onCancel = new EventEmitter()

  isVisible: boolean = false
  isLoading: boolean = false

  validateForm: FormGroup<{
    namePool: FormControl<string>
    algorithm: FormControl<string>
    session: FormControl<boolean>
  }> = this.fb.group({
    namePool: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_]*$/),
      this.duplicateNameValidator.bind(this), Validators.maxLength(50)]],
    algorithm: ['', [Validators.required]],
    session: [false]
  });

  nameList: string[] = [];

  pool: Pool = new Pool();

  @ViewChild('poolInputName') poolInputName!: ElementRef<HTMLInputElement>;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private loadBalancerService: LoadBalancerService,
              private notification: NzNotificationService) {
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

  showModal() {
    this.isVisible = true
    setTimeout(() => {this.poolInputName?.nativeElement.focus()}, 1000)
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  handleOk() {

  }

  ngAfterViewInit() {
    this.poolInputName?.nativeElement.focus();
  }

}
