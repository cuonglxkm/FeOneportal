import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { STIcon } from '@delon/abc/st';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import {
  RouterInteface,
  RouterIntefaceCreate,
  StaticRouter,
  Subnet,
} from 'src/app/shared/models/router.model';

import { RouterService } from 'src/app/shared/services/router.service';
import { ProjectModel, RegionModel, ipAddressValidatorRouter } from '../../../../../../../libs/common-utils/src';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-router-detail',
  templateUrl: './router-detail.component.html',
  styleUrls: ['../router-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouterDetailComponent implements OnInit {
  routerId: string;
  regionId: number;
  vpcId: number;
  networkId: number;
  listOfRouterInteface: RouterInteface[] = [];
  listOfRouterStatic: StaticRouter[] = [];
  listSubnetFilter = [];
  isLoadingListRouterInterface: boolean = true;
  isLoadingListRouterStatic: boolean = true;
  isLoadingRouterInterface: boolean = false;
  isLoadingRouterStatic: boolean = false;
  isLoadingSubnet: boolean = false
  isLoadingDeleteRouterInterface: boolean = false
  isLoadingDeleteRouterStatic: boolean = false
  disableSubnet: boolean = true
  isVisibleCreateInterface = false;
  routerInterfaceCreate: RouterIntefaceCreate = new RouterIntefaceCreate();

  formRouterInterface: FormGroup<{
    subnetId: FormControl<string>;
    ipAddress: FormControl<string>;
  }>;

  formRouterStatic: FormGroup<{
    destinationCIDR: FormControl<string>;
    nextHop: FormControl<string>;
  }>;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private service: RouterService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService,
    private fb: NonNullableFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    this.formRouterInterface = this.fb.group({
      subnetId: ['', Validators.required],
      ipAddress: ['', Validators.required],
    });

    this.formRouterStatic = this.fb.group({
      destinationCIDR: ['', Validators.required],
      nextHop: ['', Validators.required],
    });

    this.formRouterInterface
      .get('subnetId')
      .valueChanges.subscribe((selectedSubnetId) => {
        const selectedSubnet = this.listSubnet.find(
          (subnet) => subnet.id === parseInt(selectedSubnetId)
        );
        if (selectedSubnet) {
          const networkAddress = selectedSubnet.networkAddress;
          this.formRouterInterface
            .get('ipAddress')
            .setValidators([
              Validators.required,
              ipAddressValidatorRouter(networkAddress),
            ]);
          this.formRouterInterface.get('ipAddress').updateValueAndValidity();
        }
      });
  }

  ngOnInit(): void {
    this.routerId = this.activatedRoute.snapshot.paramMap.get('id');
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.vpcId = regionAndProject.projectId;
    this.getRouterInterfaces();
    this.getRouterStatic();
  }

  getRouterInterfaces() {
    this.isLoadingListRouterInterface = true;
    this.service
      .getRouterInterfaces(this.routerId, this.regionId, this.vpcId)
      .pipe(
        finalize(() => {
          this.isLoadingListRouterInterface= false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.isLoadingListRouterInterface= false;
          this.listOfRouterInteface = data;
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.router.note30')
          );
        },
      });
  }

  getRouterStatic() {
    this.isLoadingListRouterStatic = true;
    this.service
      .getRouterStatics(this.routerId, this.regionId, this.vpcId)
      .pipe(
        finalize(() => {
          this.isLoadingListRouterStatic = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.listOfRouterStatic = data;
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.router.note31')
          );
        },
      });
  }

  listSubnet: Subnet[] = [];

  getListSubnet() {
    this.isLoadingSubnet = true
    this.service
      .getListSubnet(this.routerId, this.regionId, this.vpcId)
      .pipe(
        finalize(() => {
          this.isLoadingSubnet= false;
          this.disableSubnet= false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.isLoadingSubnet = false;
            this.disableSubnet = false;
            this.listSubnetFilter = data.filter((record) => record !== null);
            this.listSubnet = [
              { id: '', name: '-- Chọn Subnet --', networkAddress: '' },
              ...this.listSubnetFilter,
            ];
          }
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.router.note32')
          );
          this.isLoadingSubnet = false;
        },
      });
  }


  modalCreateRouterInterface() {
    this.isVisibleCreateInterface = true;
    this.getListSubnet();
  }

  handleCancelCreateInterface() {
    this.isVisibleCreateInterface = false;
  }

  handleOkCreateInterface() {
    this.isLoadingRouterInterface = true;
    this.routerInterfaceCreate.regionId = this.regionId;
    this.routerInterfaceCreate.routerId = this.routerId;
    this.routerInterfaceCreate.subnetId = parseInt(
      this.formRouterInterface.controls.subnetId.value
    );
    this.routerInterfaceCreate.ipAddress =
      this.formRouterInterface.controls.ipAddress.value;
    this.routerInterfaceCreate.networkCustomer = '';
    console.log(this.formRouterInterface.controls.subnetId.value);
    
    if(this.formRouterInterface.controls.subnetId.value === ''){
      this.notification.warning(this.i18n.fanyi('app.status.warning'), 'Vui lòng chọn subnet');
      this.isLoadingRouterInterface = false;
    }else{
      this.service.createRouterInterface(this.routerInterfaceCreate).subscribe(
        (data) => {
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.router.note33'));
          this.isLoadingRouterInterface = false;
          this.isVisibleCreateInterface = false;
          this.formRouterInterface.reset()
          this.getRouterInterfaces();
        },
        (error) => {
          this.isLoadingRouterInterface = false;
          console.log(error);
  
          this.cdr.detectChanges();
          if (error.error.detail.includes('allocated in subnet')) {
            this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.router.note34'));
          } else if (error.error.detail === '(rule:create_port and (rule:create_port:fixed_ips and (rule:create_port:fixed_ips:subnet_id and rule:create_port:fixed_ips:ip_address))) is disallowed by policy') {
            this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.router.note35'));
          }else if (error.status === 400) {
            this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.router.note36'));
          } else {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.router.note37')
            );
          }
        },
      );
    }
    
  }


  isVisibleCreateStatic = false;
  staticRouterCreate: StaticRouter = new StaticRouter();
  modalCreateRouterStatic() {
    this.isVisibleCreateStatic = true;
  }

  handleCancelCreateStatic() {
    this.isVisibleCreateStatic = false;
  }

handleOkCreateStatic() {
  this.isLoadingRouterStatic = true;
  this.staticRouterCreate.routerId = this.routerId;
  this.staticRouterCreate.regionId = this.regionId;
  this.staticRouterCreate.vpcId = this.vpcId;
  this.staticRouterCreate.destinationCIDR =
    this.formRouterStatic.controls.destinationCIDR.value;
  this.staticRouterCreate.nextHop =
    this.formRouterStatic.controls.nextHop.value;
  this.staticRouterCreate.customerId = this.tokenService.get()?.userId;
  this.service.createStaticRouter(this.staticRouterCreate).subscribe({
    next: (data) => {
      this.notification.success(
        this.i18n.fanyi('app.status.success'),
        this.i18n.fanyi('app.router.note38')
      );
      this.isLoadingRouterStatic = false;
      this.isVisibleCreateStatic = false;
      this.formRouterStatic.reset();
      this.getRouterStatic();
    },
    error: (error) => {
      this.isLoadingRouterStatic = false;
      this.cdr.detectChanges();
      this.notification.error(
        this.i18n.fanyi('app.status.fail'),
        this.i18n.fanyi('app.router.note39')
      );
    },
  });
}

  isVisibleDeleteInterface: boolean = false;
  subnetId: number = 0;
  modalDeleteInterface(subnetId: number) {
    this.isVisibleDeleteInterface = true;
    this.subnetId = subnetId;
  }
  handleOkDeleteInterface() {
    this.isLoadingDeleteRouterInterface = true
    this.service
      .deleteRouterInterface(
        this.routerId,
        this.regionId,
        this.subnetId,
        this.vpcId
      )
      .subscribe({
        next: () => {
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.router.note40'));
          this.isVisibleDeleteInterface = false;
          this.isLoadingDeleteRouterInterface = false
          this.getRouterInterfaces();
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.router.note41')
          );
          this.isLoadingDeleteRouterInterface = false
        },
      });
  }
  handleCancelDeleteInterface() {
    this.isVisibleDeleteInterface = false;
  }

  isVisibleDeleteStatic: boolean = false;
  destinationCIDR: string = '';
  nextHop: string = '';
  modalDeleteStatic(item: StaticRouter) {
    this.isVisibleDeleteStatic = true;
    this.destinationCIDR = item.destinationCIDR;
    this.nextHop = item.nextHop;
  }
  handleOkDeleteStatic() {
    this.isLoadingDeleteRouterStatic = true
    this.service
      .deleteStaticRouter(
        this.routerId,
        this.destinationCIDR,
        this.nextHop,
        this.regionId,
        this.vpcId
      )
      .subscribe({
        next: (data: any) => {
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.router.note42'));
          this.isVisibleDeleteStatic = false;
          this.isLoadingDeleteRouterStatic = false
          this.getRouterStatic();
        },
        error: (e) => {
          this.notification.error(
            e.statusText,
            this.i18n.fanyi('app.router.note42')
          );
          this.isLoadingDeleteRouterStatic = false
        },
      });
  }
  handleCancelDeleteStatic() {
    this.isVisibleDeleteStatic = false;
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.vpcId = project?.id;
  }

  navigateToList() {
    this.router.navigate(['/app-smart-cloud/network/router']);
  }


}
