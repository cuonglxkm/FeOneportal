import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
  ImageTypesModel,
  Images,
  InstancesModel,
  RebuildInstances,
} from '../instances.model';
import { InstancesService } from '../instances.service';
import { RegionModel } from 'src/app/shared/models/region.model';

@Component({
  selector: 'one-portal-instances-edit-info',
  templateUrl: './instances-edit-info.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstancesEditInfoComponent implements OnInit {
  loading = true;

  region: number = 3;
  projectId: number = 310;
  customerId: number = 669;
  //userId: number = this.tokenService.get()?.userId;

  rebuildInstances: RebuildInstances = new RebuildInstances();

  instancesModel: InstancesModel;
  id: number;
  pagedCardListImages: Array<Array<any>> = [];
  effect = 'scrollx';

  //#region Hệ điều hành
  listImageTypes: ImageTypesModel[] = [];
  listImageVersionByType: Images[] = [];
  selectedValueVersion: any;
  isLoading = false;
  hdh: Images;
  selectedTypeImageId:number;

  getAllImageVersionByType(type: number) {
    this.dataService
      .getAllImage(null, this.region, type, this.customerId)
      .subscribe((data: any) => {
        this.listImageVersionByType = data;
      });
  }

  onInputHDH(index: number, event: any) {
    this.hdh = this.listImageVersionByType.find(x => x.id = event);
    this.selectedTypeImageId= this.hdh.imageTypeId
  }

  //#endregion

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private route: Router,
    public message: NzMessageService,
    private el: ElementRef, private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.router.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService.getById(this.id, false).subscribe((data: any) => {
          this.instancesModel = data;
          this.dataService.getAllImageType().subscribe((data: any) => {
            this.listImageTypes = data;
            for (let i = 0; i < this.listImageTypes.length; i += 4) {
              this.pagedCardListImages.push(
                this.listImageTypes.slice(i, i + 4)
              );
            }
            this.loading = false;
            this.cdr.detectChanges();
          });
        });
      }
    });
    this.cdr.detectChanges();
  }
  save(): void {
    this.rebuildInstances.regionId = this.instancesModel.regionId;
    this.rebuildInstances.customerId = this.instancesModel.customerId;
    this.rebuildInstances.imageId = this.hdh.id;
    this.rebuildInstances.flavorId = this.instancesModel.flavorId;
    this.rebuildInstances.id = this.instancesModel.id;
    this.dataService.rebuild(this.rebuildInstances).subscribe(
      (data: any) => {
        console.log(data);
        this.message.success('Thay đổi hệ điều hành thành công');
      },
      (error) => {
        console.log(error.error);
        this.message.error('Thay đổi hệ điều hành không thành công');
      }
    );
  }
  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.region = region.regionId;
    console.log(this.tokenService.get()?.userId);
  }

  navigateToEdit() {
    this.route.navigate(['/app-smart-cloud/vm/instances-edit/' + this.id]);
  }
  navigateToChangeImage() {
    this.route.navigate(['/app-smart-cloud/vm/instances-edit-info/' + this.id]);
  }
  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/vm']);
  }
}
