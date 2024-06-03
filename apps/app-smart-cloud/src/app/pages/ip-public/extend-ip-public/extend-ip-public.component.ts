import { Component, Inject, OnInit } from '@angular/core';
import { IpPublicModel } from '../../../shared/models/ip-public.model';
import { AttachedDto } from '../../../shared/dto/volume.dto';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PopupExtendVolumeComponent } from '../../volume/component/popup-volume/popup-extend-volume.component';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { IpPublicService } from '../../../shared/services/ip-public.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';
import { finalize } from 'rxjs/operators';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { OrderService } from '../../../shared/services/order.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '../../../../../../app-kafka/src/app/core/i18n/i18n.service';

@Component({
  selector: 'one-portal-extend-ip-public',
  templateUrl: './extend-ip-public.component.html',
  styleUrls: ['./extend-ip-public.component.less']
})
export class ExtendIpPublicComponent implements OnInit{
  ipInfo: IpPublicModel;
  ipAddress: any;
  attachedVm: any;
  isIpV6: boolean;

  attachedDto: AttachedDto[] = [];

  listVMs: string = '';

  isLoading: boolean = false;

  projectId: any;

  regionId: any;
  total: any;
  dateString: any;
  dateStringExpired: any;

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getIPPublicById(id);
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;

  }

  // form = new FormGroup({
  //   numOfMonth: new FormControl('', {validators: [Validators.required]}),
  // });

  private getIPPublicById(id: string) {
    this.isLoading = true;

    this.ipService.getDetailIpPublic(Number.parseInt(id))
      .pipe(finalize(() => {
        this.caculator();
      }))
      .subscribe(data => {
        this.ipInfo = data;
        this.ipAddress = data.ipAddress;
        this.attachedVm = data.attachedVm;
        this.isIpV6 = this.ipInfo.iPv6Address != null && this.ipInfo.iPv6Address != '';
        this.isLoading = false;
        this.dateString = data.createDate;
      }, error => {
        this.isLoading = false;
      }
    );
  }

  openPopupExtend() {
    const modal: NzModalRef = this.modalService.create({
      nzTitle: 'Gia hạn IP Public',
      nzContent: PopupExtendVolumeComponent,
      nzFooter: [
        {
          label: 'Hủy',
          type: 'default',
          onClick: () => modal.destroy()
        },
        {
          label: 'Đồng ý',
          type: 'primary',
          onClick: () => {
            this.router.navigate(['/app-smart-cloud/ip-public/extend/' + this.ipInfo.id]);
            modal.destroy();
          }
        }
      ]
    });
  }


  volumeStatus: Map<String, string>;
  numOfMonth = 1;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private service: IpPublicService,
              private ipService: IpPublicService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private orderService : OrderService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private modalService: NzModalService,
              private notification: NzNotificationService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', 'Đang hoạt động');
    this.volumeStatus.set('ERROR', 'Lỗi');
    this.volumeStatus.set('SUSPENDED', 'Tạm ngừng');
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/ip-public']);
    this.projectId = project.id;
  }

  backToList() {
    this.router.navigate(['/app-smart-cloud/ip-public']);
  }

  extendIpPublic() {
    const requestBody = {
      regionId: this.regionId,
      serviceName: '',
      customerId: this.tokenService.get()?.userId,
      vpcId: this.projectId,
      typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.IpExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null',
      serviceType: 4,
      actionType: 3,
      serviceInstanceId: this.ipInfo.id,
      newExpireDate: this.dateStringExpired,
      userEmail: null,
      actorEmail: null
    };
    const request = {
      customerId: this.tokenService.get()?.userId,
      createdByUserId: this.tokenService.get()?.userId,
      note: 'Gia hạn IP Public',
      orderItems: [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(requestBody),
          specificationType: 'ip_extend',
          price: this.total.data.totalAmount.amount,
          serviceDuration: this.numOfMonth
        }
      ]
    };
    var returnPath: string = window.location.pathname;
    this.orderService.validaterOrder(request).subscribe(
      data => {
        this.router.navigate(['/app-smart-cloud/order/cart'], { state: { data: request, path: returnPath } });
      },
      error => {
        this.notification.error(this.i18n.fanyi('app.status.fail'),this.i18n.fanyi('app.validate.order.fail'))
      }
    )

  }

  caculator() {
    let num = this.numOfMonth;
    if (num != null && num != undefined) {
      const dateExpired = new Date(this.ipInfo?.expiredDate);
      // dateExpired.setMonth(dateExpired.getMonth() +);
      dateExpired.setDate(dateExpired.getDate() +  Number(num)*30);
      this.dateStringExpired = dateExpired;
      const requestBody = {
        customerId: this.tokenService.get()?.userId,
        vmToAttachId: this.ipInfo.attachedVmId,
        regionId: this.regionId,
        projectId: this.projectId,
        networkId: this.ipInfo.networkId,
        id: 0,
        duration: 0,
        ipAddress: null,
        offerId: 0,
        useIPv6: null,
        vpcId: null,
        oneSMEAddonId: null,
        serviceType: 4,
        serviceInstanceId: 0,
        createDate: '0001-01-01T00:00:00',
        expireDate: '0001-01-01T00:00:00',
        saleDept: null,
        saleDeptCode: null,
        contactPersonEmail: null,
        contactPersonPhone: null,
        contactPersonName: null,
        note: null,
        createDateInContract: null,
        am: null,
        amManager: null,
        isTrial: false,
        couponCode: null,
        dhsxkd_SubscriptionId: null,
        dSubscriptionNumber: null,
        dSubscriptionType: null,
        oneSME_SubscriptionId: null,
        actionType: 0,
        serviceName: null,
        typeName: 'SharedKernel.IntegrationEvents.Orders.Specifications.IPCreateSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null',
        userEmail: null,
        actorEmail: null
      };
      const request = {
        projectId: this.projectId,
        orderItems: [
          {
            orderItemQuantity: 1,
            specificationString: JSON.stringify(requestBody),
            specificationType: 'ip_create',
            serviceDuration: num
          }
        ]
      };
      this.service.getTotalAmount(request).subscribe(
        data => {
          this.total = data;
        }
      );
    } else {
      this.total = undefined;
    }
  }
}
