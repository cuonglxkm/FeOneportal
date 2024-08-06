import {
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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  CreatePool,
  LoadBalancerModel,
} from 'src/app/shared/models/load-balancer.model';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-create-pool-in-lb',
  templateUrl: './create-pool-in-lb.component.html',
  styleUrls: ['./create-pool-in-lb.component.less'],
})
export class CreatePoolInLbComponent implements OnInit {
  @Input() region: number;
  @Input() project: number;
  @Input() loadbalancerId: number;
  @Input() listenerId: number;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;
  nameList: string[] = [];
  methodStickySession = 'HTTP_COOKIE';
  validateForm: FormGroup;

  algorithms = [
    { value: 'Round_Robin', label: 'Round_Robin' },
    { value: 'Least_Connections', label: 'Least_Connections' },
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
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private loadBalancerService: LoadBalancerService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  loadBalancer: LoadBalancerModel = new LoadBalancerModel();
  ngOnInit(): void {
    this.loadBalancerService
      .getLoadBalancerById(this.loadbalancerId, true)
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

  createPool = new CreatePool();
  showModal() {
    this.createPool = new CreatePool();
    this.getListPool();
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true;
    this.createPool.customerId = this.tokenService.get()?.userId;
    this.createPool.regionId = this.region;
    this.createPool.vpcId = this.project;
    this.createPool.loadbalancer_id = this.loadBalancer.cloudId;
    if (this.listenerId) {
      this.createPool.listener_id = this.listenerId.toString();
    } else {
      this.createPool.listener_id = null;
    }
    this.loadBalancerService.createPool(this.createPool).subscribe({
      next: (data) => {
        if (data) {
          this.isVisible = false;
          this.isLoading = false;
          this.notification.success(
            this.i18n.fanyi('app.status.success'),
            this.i18n.fanyi('app.notification.create.pool.success')
          );
        } else {
          this.isVisible = false;
          this.isLoading = false;
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.notification.create.pool.fail')
          );
        }
        this.onOk.emit(data);
      },
      error: (error) => {
        this.isVisible = false;
        this.isLoading = false;
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          error.error.detail
        );
      },
    });
  }

  getListPool() {
    this.loadBalancerService
      .getListPoolInLB(this.loadbalancerId)
      .subscribe((data) => {
        data.forEach((e) => {
          this.nameList.push(e.name);
        });
        this.isVisible = true;
        this.validateForm = new FormGroup({
          namePool: new FormControl('', {
            validators: [
              Validators.required,
              Validators.pattern(/^[a-zA-Z0-9_]*$/),
              this.duplicateNameValidator.bind(this),
              Validators.maxLength(50),
            ],
          }),
          algorithm: new FormControl('', {
            validators: [Validators.required],
          }),
          protocol: new FormControl('', {
            validators: [Validators.required],
          }),
        });
        setTimeout(() => {
          this.poolInputName?.nativeElement.focus();
        }, 300);
      });
  }
}
