import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VlanService } from '../../../../shared/services/vlan.service';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { FormCreatePort, FormSearchSubnet, Port, Subnet } from '../../../../shared/models/vlan.model';
import { getCurrentRegionAndProject } from '@shared';
import { ipAddressExistsValidator, ipAddressValidator } from '../../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { debounceTime, map, Observable, of, Subject } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';

export function portValidator(vlanService: VlanService, cidr: string, networkId: string, regionId: number): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }
    return vlanService.checkIpAvailable(control.value, cidr, networkId, regionId).pipe(
      map(data => {
        // Data processing based on API response
        return data.available ? null : { portTaken: true };
      }),
      catchError(() => of({ apiError: true }))
    );
  };
}

@Component({
  selector: 'one-portal-vlan-create-port',
  templateUrl: './vlan-create-port.component.html',
  styleUrls: ['./vlan-create-port.component.less']
})
export class VlanCreatePortComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() region: number;
  @Input() project: number;
  @Input() networkId: number;
  @Input() networkCloudId: string;
  @Input() listSubnet: Subnet[]
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isLoading: boolean = false;
  isVisible: boolean = false;


  validateForm: FormGroup<{
    idSubnet: FormControl<number>
    namePort: FormControl<string>
    ipAddress: FormControl<string>
  }>;

  // listSubnet: Subnet[] = [];
  subnetAddress: string;

  subnetSelected: any;

  idSubnet: number;
  isLoadingSubnet: boolean = false;

  ipPort: string[] = [];

  isInvalidGateway: boolean = false;
  dataSubjectGateway: Subject<any> = new Subject<any>();

  nameList: string[] = [];

  @ViewChild('portInputName') portInputName!: ElementRef<HTMLInputElement>;

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private vlanService: VlanService,
              private route: ActivatedRoute,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private fb: NonNullableFormBuilder) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('goi lai list port');
    if (changes.checkDelete) {
      this.getPortByNetwork();
    }
  }

  ngAfterViewInit(): void {
    this.portInputName?.nativeElement.focus();
  }

  focusOkButton(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submitForm();
    }
  }

  invalidGateway: string;

  onCheckPort() {
    this.dataSubjectGateway.pipe(debounceTime(600)).subscribe((res) => {
      if (res == null || res == '') {
        this.invalidGateway = '';
      } else {
        this.vlanService.getSubnetById(this.validateForm.controls.idSubnet.value).subscribe(item => {
          this.vlanService.checkIpAvailable(res, item.subnetAddressRequired, this.networkCloudId, this.region).subscribe(data => {
            this.isInvalidGateway = false;
            this.invalidGateway = '';
            const dataJson = JSON.parse(JSON.stringify(data));
            console.log('gateway data', dataJson);
          }, error => {
            if (error.status == '400') {
              console.log('error', error.error);
              this.isInvalidGateway = true;
              if (error.error.includes('Ip khong thuoc Allocation Pool!')) this.invalidGateway = 'IP không thuộc Allocation Pool!';
              if (error.error.includes('Port khong co san!')) this.invalidGateway = 'Port đã tồn tại, vui lòng nhập Port khác';
              // this.invalidGateway = error.error
            } else {
              this.invalidGateway = 'Ip address không hợp lệ';
            }
          });
        });
      }
    });
  }

  inputPort(value) {
    this.dataSubjectGateway.next(value);
  }

  showModal(): void {
    this.isVisible = true;
    this.getPortByNetwork();
    setTimeout(() => {
      this.portInputName?.nativeElement.focus();
    }, 1000);
  }

  handleCancel(): void {
    this.isVisible = false;
    this.isLoading = false;
    this.validateForm.reset();
    this.onCancel.emit();
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('form', this.validateForm.getRawValue());
      let formCreatePort = new FormCreatePort();
      formCreatePort.portName = this.validateForm.controls.namePort.value;
      formCreatePort.customerId = this.tokenService.get()?.userId;
      formCreatePort.regionId = this.region;
      formCreatePort.subnetId = this.validateForm.controls.idSubnet.value;
      formCreatePort.ipAddress = this.validateForm.controls.ipAddress.value;

      this.isLoading = true;
      this.vlanService.createPort(formCreatePort).subscribe(data => {
        this.isLoading = false;
        this.isVisible = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.vlan.note59'));
        this.onOk.emit(data);
        this.validateForm.reset();

      }, error => {
        this.isLoading = false;
        this.isVisible = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.vlan.note60') + this.i18n.fanyi(error.error.detail));
        this.validateForm.reset();
      });
    }

  }
  getPortByNetwork() {
    this.isLoading = true;
    console.log('networkcloud', this.networkCloudId)
    this.vlanService.getPortByNetwork(this.networkCloudId, this.region, 9999, 1, '')
      .pipe(debounceTime(500))
      .subscribe(data => {
        console.log('port', data);
        this.isLoading = false;
        data?.records?.forEach(item => {
          this.ipPort?.push(item.fixedIPs.toString())
        })
        data.records?.forEach(item => {
          this.nameList?.push(item?.name)
        })

      }, error => {
        this.isLoading = false;
        this.notification.error(error.statusText, 'Lấy dữ liệu thất bại')
      });
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

  ngOnInit() {
    this.validateForm = this.fb.group({
      idSubnet: [0, [Validators.required]],
      namePort: ['', [Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9_]*$/),
        this.duplicateNameValidator.bind(this)
      ]],
      ipAddress: [null as string, [ipAddressValidator(this.subnetAddress), ipAddressExistsValidator(this.ipPort)]]
    });

    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    // this.getSubnetByNetworkId();
    this.onCheckPort();

    if (this.validateForm.controls.ipAddress.value == null) {
      this.invalidGateway = '';
    }
  }


}
