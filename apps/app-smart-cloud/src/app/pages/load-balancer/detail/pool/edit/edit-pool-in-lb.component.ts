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
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  FormUpdatePool,
  LoadBalancerModel,
  PoolDetail,
} from '../../../../../shared/models/load-balancer.model';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-edit-pool-in-lb',
  templateUrl: './edit-pool-in-lb.component.html',
  styleUrls: ['./edit-pool-in-lb.component.less'],
})
export class EditPoolInLbComponent implements AfterViewInit, OnInit {
  @Input() region: number;
  @Input() project: number;
  @Input() poolId: string;
  @Input() loadBalancerId: number;
  @Input() listenerId: string;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;
  methodStickySession = 'HTTP_COOKIE';
  stickySession: boolean;
  loadBalancer: LoadBalancerModel = new LoadBalancerModel();
  
  validateForm: FormGroup<{
    namePool: FormControl<string>;
    algorithm: FormControl<string>;
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
    session: [false],
  });

  nameList: string[] = [];

  pool: PoolDetail = new PoolDetail();

  algorithms = [
    { value: 'Round_Robin', label: 'Round_Robin' },
    { value: 'Least_Connections', label: 'Least_Connections' },
    { value: 'Source_IP', label: 'Source_IP' },
  ];

  @ViewChild('poolInputName') poolInputName!: ElementRef<HTMLInputElement>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private loadBalancerService: LoadBalancerService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.loadBalancerService
      .getLoadBalancerById(this.loadBalancerId, true)
      .subscribe((data) => {
        this.loadBalancer = data;
      });
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
    this.loadBalancerService
      .getPoolDetail(this.poolId, this.loadBalancerId)
      .subscribe((data) => {
        this.pool = data;
        this.stickySession = data.sessionPersistence;
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
    this.isLoading = true;
    if (this.validateForm.valid) {
      let formUpdate = new FormUpdatePool();
      formUpdate.loadbalancerId = this.loadBalancer.cloudId;
      formUpdate.poolId = this.poolId;
      formUpdate.session = this.validateForm.controls.session.value;
      formUpdate.vpcId = this.project;
      formUpdate.regionId = this.region;
      formUpdate.name = this.validateForm.controls.namePool.value;
      formUpdate.description = this.pool?.description;
      formUpdate.adminStateUp = this.pool?.adminStateUp;
      formUpdate.lb_algorithm = this.validateForm.controls.algorithm.value;
      formUpdate.customerId = this.tokenService.get()?.userId;
      formUpdate.actorEmail = this.tokenService.get()?.email;
      this.loadBalancerService.updatePool(this.poolId, formUpdate).subscribe({
        next: (data) => {
          this.isVisible = false;
          this.isLoading = false;
          this.notification.success(
            '',
            this.i18n.fanyi('app.notification.edit.pool.success')
          );

          this.onOk.emit(data);
        },
        error: (error) => {
          this.isVisible = false;
          this.isLoading = false;
          this.notification.error(
            "",
            error.error.message
          );
        },
      });
    }
  }

  onChangeStickySession(event) {
    this.stickySession = event;
  }

  ngAfterViewInit() {
    this.poolInputName?.nativeElement.focus();
  }
}
