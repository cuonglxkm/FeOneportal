import {Component, Inject, OnInit} from '@angular/core';
import {AttachedDto, EditSizeMemoryVolumeDTO, ExtendVolumeDTO, VolumeDTO} from "../../../../shared/dto/volume.dto";
import {VolumeService} from "../../../../shared/services/volume.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NzMessageService} from "ng-zorro-antd/message";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupExtendVolumeComponent} from "../popup-volume/popup-extend-volume.component";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {EditSizeVolumeModel} from "../../../../shared/models/volume.model";

@Component({
  selector: 'app-detail-volume',
  templateUrl: './detail-volume.component.html',
  styleUrls: ['./detail-volume.component.less'],
})
export class DetailVolumeComponent implements OnInit {
  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'Volume',
    content: 'Chi tiết Volume '
  };

  volumeInfo: VolumeDTO;

  attachedDto: AttachedDto[] = [];

  listVMs: string = '';

  isLoading: boolean = false;

  ngOnInit(): void {
    const idVolume = this.activatedRoute.snapshot.paramMap.get('id');
    this.getVolumeById(idVolume);
  }

  private getVolumeById(idVolume: string) {
    this.isLoading = true;

    this.volumeSevice.getVolummeById(idVolume).subscribe(data => {

        this.volumeInfo = data;
        if(data.attachedInstances!=null){
          this.attachedDto = data.attachedInstances;
        }
        this.isLoading = false;
        if (this.attachedDto.length > 1) {
          this.attachedDto.forEach(vm => {
            this.listVMs += vm.instanceName + '\n';
          })

        }
      }, error => {
        this.isLoading = false;
      }
    )
  }

  openPopupExtend() {
    const modal: NzModalRef = this.modalService.create({
      nzTitle: 'Gia hạn Volume',
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
            this.doExtendVolume();
            modal.destroy()
          }
        }
      ]
    });
  }

  private doExtendVolume() {
    this.isLoading = true;
    //Tính thời hạn sử dụng khi tạo volume
    let createDate = new Date(this.volumeInfo.creationDate);
    let expDate = new Date(this.volumeInfo.expirationDate);
    console.log('old ExpDate: ' + expDate);
    let expiryTime = (expDate.getFullYear() - createDate.getFullYear()) * 12 + (expDate.getMonth() - createDate.getMonth());
    // Gia hạn bằng thời hạn sử dụng khi tạo.
    expDate.setMonth(expDate.getMonth() + expiryTime);

    //Call API gia hạn
    let extendsDto = new ExtendVolumeDTO();
    extendsDto.newExpireDate = expDate.toISOString();
    extendsDto.serviceInstanceId = this.volumeInfo.id;
    extendsDto.regionId = this.volumeInfo.regionId;
    extendsDto.serviceName = this.volumeInfo.name;
    extendsDto.vpcId = this.volumeInfo.vpcId;
    extendsDto.customerId = this.tokenService.get()?.userId;
    extendsDto.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.VolumeResizeSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null";
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    extendsDto.actorEmail = user.email;
    extendsDto.userEmail = user.email;
    extendsDto.serviceType = 2;
    extendsDto.actionType = 1;

    let request = new EditSizeVolumeModel();
    request.customerId = extendsDto.customerId;
    request.createdByUserId = extendsDto.customerId;
    request.note = 'extend volume';
    request.orderItems = [
      {
        orderItemQuantity: 1,
        specification: JSON.stringify(extendsDto),
        specificationType: 'volume_extend',
        price: 100000,
        serviceDuration: expiryTime
      }
    ]

    let reponse = this.volumeSevice.extendsVolume(request).subscribe(
      data => {
        this.nzMessage.create('success', 'Gia hạn Volume thành công.')
        this.isLoading = false

      }, error => {
        this.nzMessage.create('error', 'Gia hạn Volume không thành công.')
        this.isLoading = false
      }
    );

  }

  navigateEditVolume(idVolume: number) {
    this.router.navigate(['/app-smart-cloud/volume/edit/' + idVolume]);
  }

  volumeStatus: Map<String, string>;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private volumeSevice: VolumeService, private router: Router, private activatedRoute: ActivatedRoute, private nzMessage: NzMessageService, private modalService: NzModalService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', 'Đang hoạt động');
    this.volumeStatus.set('ERROR', 'Lỗi');
    this.volumeStatus.set('SUSPENDED', 'Tạm ngừng');
  }

}
