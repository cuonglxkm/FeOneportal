import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CreatePool } from 'src/app/shared/models/load-balancer.model';

@Component({
  selector: 'one-portal-create-pool-in-lb',
  templateUrl: './create-pool-in-lb.component.html',
  styleUrls: ['./create-pool-in-lb.component.less'],
})
export class CreatePoolInLbComponent implements AfterViewInit, OnInit {
  @Input() region: number;
  @Input() project: number;
  @Input() loadbalancerId: string;
  @Input() listenerId: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;

  validateForm: FormGroup<{
    namePool: FormControl<string>;
    algorithm: FormControl<string>;
    protocol: FormControl<string>;
    session: FormControl<boolean>;
  }> = this.fb.group({
    namePool: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9_]*$/),
        this.duplicateNameValidator.bind(this),
        Validators.maxLength(50),
      ],
    ],
    algorithm: ['', [Validators.required]],
    protocol: ['', [Validators.required]],
    session: [false],
  });

  nameList: string[] = [];

  algorithms = [
    { value: 'Roud_Robin', label: 'Roud_Robin' },
    { value: 'Least_Connection', label: 'Least_Connection' },
    { value: 'Source_IP', label: 'Source_IP' },
  ];

  protocols = [
    { value: 'HTTP', label: 'HTTP' },
    { value: 'HTTPS', label: 'HTTPS' },
    { value: 'TCP', label: 'TCP' },
  ];

  @ViewChild('poolInputName') poolInputName!: ElementRef<HTMLInputElement>;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private loadBalancerService: LoadBalancerService,
    private notification: NzNotificationService
  ) {}

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

  createPool = new CreatePool();
  showModal() {
    this.isVisible = true;
    setTimeout(() => {
      this.poolInputName?.nativeElement.focus();
    }, 1000);
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  handleOk() {
    this.createPool.customerId = this.tokenService.get()?.userId;
    this.createPool.regionId = this.region;
    this.createPool.vpcId = this.project;
    this.createPool.loadbalancer_id = this.loadbalancerId.toString();
    if (this.listenerId) {
      this.createPool.listener_id = this.listenerId.toString();
    } else {
      this.createPool.listener_id = '';
    }
    this.loadBalancerService.createPool(this.createPool).subscribe({
      next: (data) => {
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
      },
      error: (error) => {
        this.isVisible = false;
        this.isLoading = false;
        this.notification.error('Thất bại', 'Cập nhật Pool thất bại');
      },
    });
  }

  getListPool() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.poolInputName?.nativeElement.focus();
  }
}
