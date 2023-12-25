import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Flavors,
  IPPublicModel,
  IPSubnetModel,
  InstancesModel,
  SecurityGroupModel,
  UpdateInstances,
} from '../instances.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InstancesService } from '../instances.service';
import { finalize } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { LoadingService } from '@delon/abc/loading';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { NguCarouselConfig } from '@ngu/carousel';
import { slider } from '../../../../../../../libs/common-utils/src/lib/slide-animation';

interface InstancesForm {
  name: FormControl<string>;
}
class ConfigCustom {
  //cấu hình tùy chỉnh
  vCPU?: number = 0;
  ram?: number = 0;
  capacity?: number = 0;
  iops?: string = '000';
  priceHour?: string = '000';
  priceMonth?: string = '000';
}

@Component({
  selector: 'one-portal-instances-edit',
  templateUrl: './instances-edit.component.html',
  styleUrls: ['../instances-list/instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slider],
})
export class InstancesEditComponent implements OnInit {
  listOfOption: Array<{ value: string; label: string }> = [];
  reverse = true;
  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    // items: new FormArray<FormGroup<InstancesForm>>([]),
  });

  //danh sách các biến của form model
  id: number;
  instancesModel: InstancesModel;

  updateInstances: UpdateInstances = new UpdateInstances();
  region: number;
  projectId: number = 4079;
  customerId: number = 669;
  userId: number = 669;
  today: Date = new Date();
  ipPublicValue: string = '';
  isUseIPv6: boolean = false;
  isUseLAN: boolean = false;
  passwordVisible = false;
  password?: string;
  numberMonth: number = 1;
  hdh: any;
  flavor: any;
  flavorCloud: any;
  configCustom: ConfigCustom = new ConfigCustom(); //cấu hình tùy chỉnh

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

  //#region HDD hay SDD
  activeBlockHDD: boolean = true;
  activeBlockSSD: boolean = false;

  initHDD(): void {
    this.activeBlockHDD = true;
    this.activeBlockSSD = false;
  }
  initSSD(): void {
    this.activeBlockHDD = false;
    this.activeBlockSSD = true;
  }
  //#endregion

  //#region Chọn IP Public Chọn Security Group
  listIPPublic: IPPublicModel[] = [];
  listSecurityGroup: SecurityGroupModel[] = [];
  listIPPublicDefault: [{ id: ''; ipAddress: 'Mặc định' }];
  selectedSecurityGroup: any[] = [];

  getAllSecurityGroup() {
    this.dataService
      .getAllSecurityGroup(this.region, this.userId, this.projectId)
      .subscribe((data: any) => {
        console.log('getAllSecurityGroup', data);
        this.listSecurityGroup = data;
        //this.selectedSecurityGroup.push(this.listSecurityGroup[0]);
      });
  }
  onChangeSecurityGroup(even?: any) {
    console.log(even);
    console.log('selectedSecurityGroup', this.selectedSecurityGroup);
  }

  //#endregion

  //#region Gói cấu hình/ Cấu hình tùy chỉnh
  activeBlockFlavors: boolean = true;
  activeBlockFlavorCloud: boolean = false;
  listFlavors: Flavors[] = [];
  pagedCardList: Array<Array<any>> = [];
  effect = 'scrollx';

  selectedElementFlavor: number = null;
  isInitialClass = true;
  isNewClass = false;

  initFlavors(): void {
    this.activeBlockFlavors = true;
    this.activeBlockFlavorCloud = false;
    this.dataService
      .getAllFlavors(false, this.region, false, false, true)
      .subscribe((data: any) => {
        this.listFlavors = data;
        // Divide the cardList into pages with 4 cards per page
        for (let i = 0; i < this.listFlavors.length; i += 4) {
          this.pagedCardList.push(this.listFlavors.slice(i, i + 4));
        }
      });
  }

  initFlavorCloud(): void {
    this.activeBlockFlavors = false;
    this.activeBlockFlavorCloud = true;
  }

  onInputFlavors(event: any) {
    this.flavor = this.listFlavors.find((flavor) => flavor.id === event);
    console.log(this.flavor);
  }

  selectElementInputFlavors(id: any) {
    this.selectedElementFlavor = id;
  }

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private router: ActivatedRoute,
    public message: NzMessageService,
    private renderer: Renderer2,
    private loadingSrv: LoadingService
  ) {}

  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.region = region.regionId;
    this.initFlavors();
    this.selectedSecurityGroup = [];
    this.getAllSecurityGroup();
    console.log(this.tokenService.get()?.userId);
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
    this.selectedSecurityGroup = [];
    this.getAllSecurityGroup();
  }

  ngOnInit(): void {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });

    this.userId = this.tokenService.get()?.userId;
    this.getAllSecurityGroup();

    this.router.paramMap.subscribe((param) => {
      if (param.get('id') != null) {
        this.id = parseInt(param.get('id'));
        this.dataService.getById(this.id, false).subscribe((data: any) => {
          this.instancesModel = data;
          this.selectedElementFlavor = this.instancesModel.flavorId;
          this.region = this.instancesModel.regionId;
          this.projectId = this.instancesModel.projectId;
          this.initFlavors();
          this.dataService
            .getAllSecurityGroupByInstance(
              this.instancesModel.cloudId,
              this.instancesModel.regionId,
              this.instancesModel.customerId,
              this.instancesModel.projectId
            )
            .pipe(finalize(() => this.loadingSrv.close()))
            .subscribe((datasg: any) => {
              console.log('getAllSecurityGroupByInstance', datasg);
              var arraylistSecurityGroup = datasg.map((obj) =>
                obj.id.toString()
              );
              this.selectedSecurityGroup = arraylistSecurityGroup;
              this.cdr.detectChanges();
            });
        });
      }
    });
  }
  navigateToCreate() {
    this.route.navigate(['/app-smart-cloud/instances/instances-create']);
  }
  navigateToChangeImage() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit-info/' + this.id,
    ]);
  }
  navigateToEdit() {
    this.route.navigate([
      '/app-smart-cloud/instances/instances-edit/' + this.id,
    ]);
  }
  returnPage(): void {
    this.route.navigate(['/app-smart-cloud/instances']);
  }

  save(): void {
    this.modalSrv.create({
      nzTitle: 'Xác nhận thông tin thay đổi',
      nzContent:
        'Quý khách chắn chắn muốn thực hiện thay đổi thông tin máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.readyEdit();
      },
    });
  }

  readyEdit(): void {
    this.updateInstances.id = this.instancesModel.id;
    this.updateInstances.name = this.instancesModel.name;
    this.updateInstances.regionId = 3; // this.region;
    this.updateInstances.projectId = 4079; // this.projectId;
    this.updateInstances.customerId = 669; // this.customerId;
    this.updateInstances.imageId = 113; // this.hdh.id;
    this.updateInstances.flavorId = 368; //this.flavor.id;
    this.updateInstances.storage = 1;
    this.updateInstances.securityGroups = null;
    this.updateInstances.duration = 0;
    this.updateInstances.listServicesToBeExtended = null;
    this.updateInstances.newExpiredDate = null;

    this.dataService.update(this.updateInstances).subscribe({
      next: (next) => {
        console.log(next);
        this.message.success('Cập nhật máy ảo thành công');
        this.route.navigate(['/app-smart-cloud/instances']);
      },
      error: (e) => {
        console.log(e);
        this.message.error('Cập nhật máy ảo không thành công');
      },
    });
  }

  cancel(): void {
    this.route.navigate(['/app-smart-cloud/instances']);
  }
}
