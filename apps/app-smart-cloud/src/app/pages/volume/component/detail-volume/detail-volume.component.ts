import { Component, Inject, OnInit } from '@angular/core';
import { AttachedDto, VolumeDTO } from '../../../../shared/dto/volume.dto';
import { VolumeService } from '../../../../shared/services/volume.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel, RegionModel } from '../../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SizeInCloudProject } from 'src/app/shared/models/project.model';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { SupportService } from '../../../../shared/models/catalog.model';

@Component({
  selector: 'app-detail-volume',
  templateUrl: './detail-volume.component.html',
  styleUrls: ['./detail-volume.component.less']
})
export class DetailVolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  volumeInfo: VolumeDTO = new VolumeDTO();

  attachedDto: AttachedDto[] = [];

  listVMs: string = '';

  isLoading: boolean = true;

  typeVPC: number;

  convertedListVMs: string;


  sizeInCloudProject: SizeInCloudProject = new SizeInCloudProject();

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    // this.projectService.getByRegion(this.region).subscribe(data => {
    //   if (data.length){
    //     localStorage.setItem("projectId", data[0].id.toString())
    this.router.navigate(['/app-smart-cloud/volumes']);
    //   }
    // });
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVPC = project.type;

    // this.router.navigate(['/app-smart-cloud/volumes'])
    // this.getListVolumes()
  }

  userChangeProject(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/volumes']);
    //
  }

  ngOnInit(): void {
    const idVolume = this.activatedRoute.snapshot.paramMap.get('id');
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.getActiveServiceByRegion()
    // this.customerId = this.tokenService.get()?.userId
    this.getVolumeById(Number.parseInt(idVolume));
  }

  convertString(str: string): string {
    const parts = str.trim().split('\n');
    if (parts.length === 1) {
      return str;
    }
    return parts.join(', ');
  }

  getVolumeById(idVolume: number) {
    this.isLoading = true;
    this.volumeSevice.getVolumeById(idVolume, this.project).subscribe(data => {
        this.isLoading = false;
        console.log('data get volume by id', data);
        this.volumeInfo = data;
        if (data.attachedInstances != null) {
          this.attachedDto = data.attachedInstances;
        }

        if (this.attachedDto.length > 0) {
          this.attachedDto.forEach(vm => {
            this.listVMs += vm.instanceName + '\n'
          });
          // this.convertedListVMs = this.listVMs.replace(/ /g, ', ');
        }
      }, error => {
        if (error.error.message === 'Not Found') {
          this.router.navigate(['/app-smart-cloud/volumes']);
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('volume.notification.access.denied'));
        } else {
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi(error.error.message));
        }
        this.isLoading = false;
      }
    );
  }

  navigateEditVolume(idVolume: number) {
    this.router.navigate(['/app-smart-cloud/volume/edit/' + idVolume]);
  }

  navigateToRenew(idVolume: number) {
    this.router.navigate(['/app-smart-cloud/volumes/renew/' + idVolume]);
  }

  navigateToResizeVPC(idVolume: number) {
    this.router.navigate(['/app-smart-cloud/volume/vpc/resize/' + idVolume]);
  }

  volumeStatus: Map<String, string>;

  typeMultiple: boolean;
  typeEncrypt: boolean;
  typeSnapshot: boolean;
  serviceActiveByRegion: SupportService[] = [];

  getActiveServiceByRegion() {
    this.isLoading = true
    this.catalogService.getActiveServiceByRegion(
      ['volume-ssd', 'volume-hdd', 'MultiAttachment', 'Encryption', 'volume-snapshot-ssd', 'volume-snapshot-hdd'], this.region)
      .subscribe(data => {
        this.isLoading = false
        this.serviceActiveByRegion = data;
        this.serviceActiveByRegion.forEach(item => {
          this.typeSnapshot = ['volume-snapshot-hdd', 'volume-snapshot-ssd'].includes(item.productName);

          this.typeMultiple = ['MultiAttachment'].includes(item.productName);

          this.typeEncrypt = ['Encryption'].includes(item.productName);
        })
      }, error => {
        this.isLoading = false
        this.typeEncrypt = false
        this.typeMultiple = false
        this.typeSnapshot = false
        this.serviceActiveByRegion = []
      });
  }

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private volumeSevice: VolumeService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private notification: NzNotificationService,
              private catalogService: CatalogService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {



    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', this.i18n.fanyi('app.status.running').toUpperCase());
    this.volumeStatus.set('ERROR', this.i18n.fanyi('app.status.error').toUpperCase());
    this.volumeStatus.set('SUSPENDED', this.i18n.fanyi('app.status.suspend').toUpperCase());
  }

}
