import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '@env/environment';
import { addDays } from 'date-fns';
import {
  DataPayment,
  ItemPayment,
} from 'src/app/pages/instances/instances.model';
import {
  ServiceActionType,
  ServiceType,
} from 'src/app/shared/enums/common.enum';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { VpnSiteToSiteService } from 'src/app/shared/services/vpn-site-to-site.service';
import {
  RegionModel,
  ProjectModel,
} from '../../../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-vpn-s2s-extend',
  templateUrl: './vpn-s2s-extend.component.html',
  styleUrls: ['./vpn-s2s-extend.component.less'],
})
export class VpnS2sExtendComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  numberMonth: number = 1;
  totalAmount: number = 0;
  totalincludesVAT: number = 0;
  unitOfMeasure: string = '';
  offerDatas: any;
  loading = false;
  offer: any;
  dateString = new Date();
  expiredDate: Date = addDays(this.dateString, 30);
  newExpiredDate: any;
  isEnable = false;
  spec: any;
  vatNumber = 0;
  vatPer = 10;
  vpn: any;
  isLoadingAction: boolean = false;
  vatDisplay;
  timeSelected: any;
  isVisiblePopupError: boolean = false;
  errorList: string[] = [];
  /**
   *
   */

  validateForm: FormGroup<{
    time: FormControl<number>;
  }> = this.fb.group({
    time: [1],
  });
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(
    private catalogService: CatalogService,
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService,
    private vpnSiteToSiteService: VpnSiteToSiteService,
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {
    this.unitOfMeasure = environment.unitOfMeasureVpn;
  }
  ngOnInit(): void {
    this.numberMonth = 1;
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;
  }

  userChangeProject() {
    this.router.navigate(['/app-smart-cloud/vpn-site-to-site']);
  }

  closePopupError() {
    this.isVisiblePopupError = false;
  }

  getOffers() {
    // this.offerDatas = [];
    this.loading = true;
    this.catalogService
      .getCatalogOffer(null, this.region, this.unitOfMeasure, null)
      .pipe()
      .subscribe((data) => {
        if (data && data.length > 0) {
          this.offerDatas = [];
          data.forEach((item) => {
            let bandwidth = item['characteristicValues'].find(
              (x) => x['charName'] == 'Bandwidth'
            );
            this.offerDatas.push({
              Id: item['id'],
              OfferName: item['offerName'],
              Bandwidth: bandwidth['charOptionValues'][0],
              Price: item['price']['fixedPrice']['amount'],
            });
          });
          this.getOffer();
        }
        this.loading = false;
      });
  }

  caculator(event) {
    if (this.offer) {
      this.totalAmount =
        this.offer['Price'] * this.validateForm.controls.time.value;
      this.totalincludesVAT =
        this.totalAmount * ((this.vatNumber ? this.vatNumber : 0.1) + 1);
      this.specChange();
      this.priceChange();
    }
    this.expiredDate = addDays(
      this.dateString,
      30 * this.validateForm.controls.time.value
    );
  }

  invalid: boolean = false;
  onChangeTime(value) {
    if (value == undefined) {
      this.invalid = true;
      this.totalAmount = 0;
      this.totalincludesVAT = 0;
      this.vatDisplay = 0;
    } else {
      this.invalid = false;
      this.timeSelected = value;
      this.validateForm.controls.time.setValue(this.timeSelected);
      console.log(this.timeSelected);
      this.priceChange();
    }
  }

  extend() {
    const request = {
      customerId: this.tokenService.get()?.userId,
      createdByUserId: this.tokenService.get()?.userId,
      note: 'Gia hạn VPN site to site',
      orderItems: [
        {
          orderItemQuantity: 1,
          specification: JSON.stringify(this.spec),
          specificationType: 'vpnsitetosite_extend',
          price: this.totalAmount,
          serviceDuration: this.validateForm.controls.time.value,
        },
      ],
    };

    this.orderService.validaterOrder(request).subscribe({
      next: (data) => {
        if (data.success) {
          var returnPath: string = window.location.pathname;
          this.router.navigate(['/app-smart-cloud/order/cart'], {
            state: { data: request, path: returnPath },
          });
        } else {
          this.isVisiblePopupError = true;
          this.errorList = data.data;
        }
      },
      error: (e) => {
        this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          e.error.detail
        );
      },
    });
  }

  priceChange() {
    this.isLoadingAction = true;
    let itemPayment: ItemPayment = new ItemPayment();
    itemPayment.orderItemQuantity = 1;
    itemPayment.specificationString = JSON.stringify(this.spec);
    itemPayment.specificationType = 'vpnsitetosite_extend';
    itemPayment.sortItem = 0;
    itemPayment.serviceDuration = this.validateForm.controls.time.value;
    let dataPayment: DataPayment = new DataPayment();
    dataPayment.orderItems = [itemPayment];
    dataPayment.projectId = 0;
    this.orderService.getTotalAmount(dataPayment).subscribe((result) => {
      this.isLoadingAction = false;
      if (result && result.data && result.data.currentVAT) {
        this.vatNumber = result.data.currentVAT;
        this.vatPer = this.vatNumber * 100;
        this.vatDisplay = result.data.totalVAT.amount;
        this.totalincludesVAT = Number.parseFloat(
          result.data.totalPayment.amount
        );
        this.totalAmount = Number.parseFloat(result.data.totalAmount.amount);
        this.newExpiredDate = result.data.orderItemPrices[0].expiredDate;
      }
    });
  }

  specChange() {
    this.spec = {
      regionId: this.region,
      serviceName: null,
      customerId: this.tokenService.get()?.userId,
      vpcId: this.project,
      typeName:
        'SharedKernel.IntegrationEvents.Orders.Specifications.VpnSiteToSiteExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null',
      serviceType: ServiceType.VPNSiteToSites,
      actionType: ServiceActionType.EXTEND,
      serviceInstanceId: this.vpn['id'],
      newExpireDate: this.expiredDate,
      userEmail: null,
      actorEmail: null,
    };
  }

  getOffer() {
    this.loading = true;
    this.vpnSiteToSiteService
      .getVpnSiteToSite(0)
      .pipe()
      .subscribe(
        (data) => {
          this.loading = false;
          if (data.body === null || data.body === undefined) {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              'Bản ghi không tồn tại'
            );
            this.router.navigateByUrl('/app-smart-cloud/vpn-site-to-site');
          } else {
            this.vpn = data.body;
            this.dateString = new Date(this.vpn['expiredDate']);
            this.expiredDate = addDays(this.dateString, 30);
            this.offer = this.offerDatas.find(
              (x) =>
                x['OfferName'] == data.body['offerName'] &&
                x['Bandwidth'] == data.body['bandwidth']
            );
            if (this.offer) {
              let element = this.el.nativeElement.querySelector(
                `#offer-title-${this.offer['Id']}`
              );
              let listTr = element.parentNode.parentNode.children;
              for (let elementTr of listTr) {
                this.renderer.addClass(elementTr, 'disable-class');
              }
              this.renderer.addClass(element.parentNode, 'tr-selected');
              this.totalAmount =
                this.offer['Price'] * this.validateForm.controls.time.value;
              this.totalincludesVAT =
                this.totalAmount *
                ((this.vatNumber ? this.vatNumber : 0.1) + 1);
              this.specChange();
              this.priceChange();
              this.isEnable = true;
            }
          }
        },
        (error) => {
          this.loading = false;
          if (
            error.error.detail.includes('made requires authentication') ||
            error.error.detail.includes('could not be found')
          ) {
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              'Bản ghi không tồn tại'
            );
            this.router.navigateByUrl('/app-smart-cloud/vpn-site-to-site');
          }
        }
      );
  }
}
