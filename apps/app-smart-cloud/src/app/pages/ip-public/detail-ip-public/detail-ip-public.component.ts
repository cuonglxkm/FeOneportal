import {Component, Inject} from '@angular/core';
import {AttachedDto, ExtendVolumeDTO, VolumeDTO} from "../../../shared/dto/volume.dto";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {PopupExtendVolumeComponent} from "../../volume/component/popup-volume/popup-extend-volume.component";
import {EditSizeVolumeModel} from "../../../shared/models/volume.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {VolumeService} from "../../../shared/services/volume.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NzMessageService} from "ng-zorro-antd/message";
import {IpPublicService} from "../../../shared/services/ip-public.service";
import {IpPublicModel} from "../../../shared/models/ip-public.model";

@Component({
  selector: 'one-portal-detail-ip-public',
  templateUrl: './detail-ip-public.component.html',
  styleUrls: ['./detail-ip-public.component.less'],
})
export class DetailIpPublicComponent {
  headerInfo = {
    breadcrumb1: 'Home',
    breadcrumb2: 'Dịch vụ',
    breadcrumb3: 'IP Public',
    content: 'Chi tiết IP Public '
  };

  ipInfo: IpPublicModel;

  isIpV6: boolean;

  attachedDto: AttachedDto[] = [];

  listVMs: string = '';

  isLoading: boolean = false;

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getIPPublicById(id);

  }

  private getIPPublicById(id: string) {
    this.isLoading = true;

    this.ipService.getDetailIpPublic(Number.parseInt(id)).subscribe(data => {
        this.ipInfo = data;
        this.isIpV6 = this.ipInfo.iPv6Address != null && this.ipInfo.iPv6Address != '';
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
      }
    )
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
            this.doExtendVolume();
            modal.destroy()
          }
        }
      ]
    });
  }

  private doExtendVolume() {

  }


  volumeStatus: Map<String, string>;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private volumeSevice: VolumeService,
              private ipService: IpPublicService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private nzMessage: NzMessageService,
              private modalService: NzModalService) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', 'Đang hoạt động');
    this.volumeStatus.set('ERROR', 'Lỗi');
    this.volumeStatus.set('SUSPENDED', 'Tạm ngừng');
  }
}
