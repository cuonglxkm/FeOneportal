import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormUpdatePool, PoolDetail } from '../../../../../shared/models/load-balancer.model';

@Component({
  selector: 'one-portal-edit-pool-in-lb',
  templateUrl: './edit-pool-in-lb.component.html',
  styleUrls: ['./edit-pool-in-lb.component.less']
})
export class EditPoolInLbComponent implements AfterViewInit {
  @Input() region: number;
  @Input() project: number;
  @Input() poolId: string;
  @Input() loadBlancerId: number;
  @Input() listenerId: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

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

  pool: PoolDetail = new PoolDetail();

  algorithms = [
    { value: 'Roud_Robin', label: 'Roud_Robin' },
    { value: 'Least_Connection', label: 'Least_Connection' },
    { value: 'Source_IP', label: 'Source_IP' }
  ];

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
    this.isVisible = true;
    this.getDetailPool();
    setTimeout(() => {
      this.poolInputName?.nativeElement.focus();
    }, 1000);
  }

  getDetailPool() {
    this.loadBalancerService.getPoolDetail(this.poolId, this.loadBlancerId).subscribe(data => {
      this.pool = data;

      this.validateForm.controls.namePool.setValue(data.name);
      this.validateForm.controls.algorithm.setValue(data.lb_algorithm);
      this.validateForm.controls.session.setValue(data.sessionPersistence);
    });
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  handleOk() {
    if (this.validateForm.valid) {
      let formUpdate = new FormUpdatePool();
      formUpdate.poolId = this.poolId;
      formUpdate.session = this.validateForm.controls.session.value;
      this.loadBalancerService.updatePool(this.poolId, formUpdate).subscribe(data => {
        if (data) {
          this.isVisible = false;
          this.isLoading = false;
          this.notification.success('Thành công', 'Cập nhật Pool thành công');
        } else {
          this.isVisible = false;
          this.isLoading = false;
          this.notification.error('Thất bại', 'Cập nhật Pool thất bại');
        }
        this.onOk.emit(data);
      }, error => {
        this.isVisible = false;
        this.isLoading = false;
        this.notification.error('Thất bại', 'Cập nhật Pool thất bại');
        this.onOk.emit(error);
      });
    }

  }

  ngAfterViewInit() {
    this.poolInputName?.nativeElement.focus();
  }

}