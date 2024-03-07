import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {OrderService} from "../../../shared/services/order.service";
import {OrderDTOSonch} from "../../../shared/models/order.model";
import {finalize} from "rxjs";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.less'],
})
export class OrderDetailComponent {
  // id: any;
  // regionId: any;
  // projectId: any;
  // data: OrderDTOSonch;
  // currentStep = 1;
  // titleStepFour = 'test thôi';

  // constructor(private activatedRoute: ActivatedRoute,
  //             private service: OrderService,
  //             private notification: NzNotificationService) {
  // }

  // ngOnInit() {
  //   this.id = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
  //   this.service.getDetail(this.id)
  //     .pipe(finalize(() => {
  //       if (this.data.statusCode == 4) {
  //         this.titleStepFour = 'Đã cài đặt thành công';
  //       } else if (this.data.statusCode == 5) {
  //         if (this.data.invoiceCode != '') {
  //           this.titleStepFour = 'Gặp sự cố';
  //         } else {
  //           this.titleStepFour = '';
  //         }
  //       } else {
  //         this.titleStepFour = 'Đã cài đặt';
  //       }
  //     }))
  //     .subscribe({
  //         next: data => {
  //           this.data = data;
  //         },
  //         error: e => {
  //           this.notification.error('Thất bại', 'Lấy dữ liệu thất bại')
  //         },
  //       }
  //     )
  // }

  // onRegionChange(region: RegionModel) {
  //   this.regionId = region.regionId;
  // }

  // projectChange(project: ProjectModel) {
  //   this.projectId = project.id;
  // }
}
