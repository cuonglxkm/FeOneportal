import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {
  ImageTypesModel,
  Image,
  InstancesModel,
  RebuildInstances,
  OfferItem,
} from '../instances.model';
import { InstancesService } from '../instances.service';
import { RegionModel } from 'src/app/shared/models/region.model';
import { finalize } from 'rxjs';
import { LoadingService } from '@delon/abc/loading';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { getCurrentRegionAndProject } from '@shared';

@Component({
  selector: 'one-portal-instances-edit-info',
  templateUrl: './instances-edit-info.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesEditInfoComponent implements OnInit {
  loading = true;

  region: number;
  projectId: number;
  customerId: number;
  email: string;
  //userId: number = this.tokenService.get()?.userId;

  rebuildInstances: RebuildInstances = new RebuildInstances();

  instancesModel: InstancesModel;
  id: number;
  pagedCardListImages: Array<Array<any>> = [];

  //#region Hệ điều hành
  listImageTypes: ImageTypesModel[] = [];
  isSelected: boolean = false;
  hdh: number;
  currentImage: Image;
  listSelectedImage = [];
  selectedImageTypeId: number;
  listOfImageByImageType: Map<number, Image[]> = new Map();
  imageTypeId = [];
  securityGroupStr = '';

  public carouselTileConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 4, lg: 5, all: 0 },
    speed: 250,
    point: {
      visible: true,
    },
    touch: true,
    loop: true,
    // interval: { timing: 1500 },
    animation: 'lazy',
  };

  onInputHDH(event: any, index: number, imageTypeId: number) {
    this.hdh = event;
    this.selectedImageTypeId = imageTypeId;
    for (let i = 0; i < this.listSelectedImage.length; ++i) {
      if (i != index) {
        this.listSelectedImage[i] = 0;
      }
    }
    this.isSelected = true;
    console.log('Hệ điều hành', this.hdh);
    console.log('list seleted Image', this.listSelectedImage);
  }

  //#endregion

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private route: Router,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService
  ) {}

  @ViewChild('myCarouselImage') myCarouselImage: NguCarousel<any>;
  reloadCarousel: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.reloadCarousel = true;
    this.updateActivePoint();
  }

  ngAfterViewInit(): void {
    this.updateActivePoint(); // Gọi hàm này sau khi view đã được init để đảm bảo có giá trị cần thiết
  }

  updateActivePoint(): void {
    // Gọi hàm reloadCarousel khi cần reload
    if (this.reloadCarousel) {
      this.reloadCarousel = false;
      setTimeout(() => {
        this.myCarouselImage.reset();
      }, 100);
    }
  }

  ngOnInit(): void {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.email = this.tokenService.get()?.email;
    this.getAllImageType();
    this.cdr.detectChanges();
    this.router.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService
          .getById(this.id, true)
          .subscribe((dataInstance: any) => {
            this.instancesModel = dataInstance;

            if (this.instancesModel.securityGroupStr != null) {
              let SGSet = new Set<string>(
                this.instancesModel.securityGroupStr.split(',')
              );
              this.securityGroupStr = Array.from(SGSet).join(', ');
            }
            this.region = this.instancesModel.regionId;
            this.getListIpPublic();
            this.getAllOfferImage(
              this.imageTypeId,
              this.instancesModel.imageId
            );
            this.dataService
              .getImageById(this.instancesModel.imageId)
              .pipe(finalize(() => this.loadingSrv.close()))

              .subscribe((dataimage: any) => {
                this.currentImage = dataimage;
                this.loading = false;
                this.cdr.detectChanges();
              });
            this.cdr.detectChanges();
          });
      }
    });
    this.cdr.detectChanges();
  }

  listIPStr = '';
  getListIpPublic() {
    this.dataService
      .getPortByInstance(this.id, this.region)
      .subscribe((dataNetwork: any) => {
        let listIP: string[] = [];
        dataNetwork.forEach((e) => {
          listIP = listIP.concat(e.fixedIPs);
        });
        this.listIPStr = listIP.join(', ');
        this.cdr.detectChanges();
      });
  }

  getAllImageType() {
    this.dataService.getAllImageType().subscribe((data: any) => {
      this.listImageTypes = data;
      this.listImageTypes.forEach((e) => {
        this.imageTypeId.push(e.id);
      });
      console.log('list image types', this.listImageTypes);
    });
  }

  getAllOfferImage(imageTypeId: any[], currentImageId: number) {
    imageTypeId.forEach((id) => {
      let listImage: Image[] = [];
      this.listOfImageByImageType.set(id, listImage);
    });
    this.dataService
      .getListOffers(this.region, 'VM-Image')
      .subscribe((data: OfferItem[]) => {
        data.forEach((e: OfferItem) => {
          if (e.status.toUpperCase() == 'ACTIVE') {
            let tempImage = new Image();
            e.characteristicValues.forEach((char) => {
              if (char.charOptionValues[0] == 'Id') {
                tempImage.id = Number.parseInt(char.charOptionValues[1]);
                tempImage.name = e.offerName;
              }
              if (char.charOptionValues[0] == 'ImageTypeId') {
                if (tempImage.id != currentImageId) {
                  this.listOfImageByImageType
                    .get(Number.parseInt(char.charOptionValues[1]))
                    .push(tempImage);
                }
              }
            });
          }
        });
        this.cdr.detectChanges();
        console.log('list Images', this.listOfImageByImageType);
      });
  }

  onRegionChange(region: RegionModel) {
    this.route.navigate(['/app-smart-cloud/instances']);
  }
  onProjectChange(project: any) {
    this.route.navigate(['/app-smart-cloud/instances']);
  }

  isVisibleUpdate: boolean = false;
  showModalUpdate() {
    this.isVisibleUpdate = true;
  }
  handleOkUpdate() {
    this.isVisibleUpdate = false;
    this.rebuildInstances.regionId = this.instancesModel.regionId;
    this.rebuildInstances.customerId = this.instancesModel.customerId;
    this.rebuildInstances.imageId = this.hdh;
    this.rebuildInstances.id = this.instancesModel.id;
    this.dataService.rebuild(this.rebuildInstances).subscribe({
      next: (data: any) => {
        this.notification.success('', 'Thay đổi hệ điều hành thành công');
        this.returnPage();
      },
      error: (e) => {
        this.notification.error(
          e.statusText,
          'Thay đổi hệ điều hành không thành công'
        );
      },
    });
  }
  handleCancelUpdate() {
    this.isVisibleUpdate = false;
  }

  navigateToEdit() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit/' + this.id,
    ]);
  }

  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/instances']);
  }
}
