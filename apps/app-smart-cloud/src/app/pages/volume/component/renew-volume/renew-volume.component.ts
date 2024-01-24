import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {VolumeService} from "../../../../shared/services/volume.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AttachedDto, VolumeDTO} from "../../../../shared/dto/volume.dto";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'one-portal-renew-volume',
  templateUrl: './renew-volume.component.html',
  styleUrls: ['./renew-volume.component.less'],
})
export class RenewVolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idVolume: number

  volumeInfo: VolumeDTO = new VolumeDTO()

  attachedDto: AttachedDto[] = [];

  listVMs: string = '';

  volumeStatus: Map<String, string>;

  validateForm: FormGroup<{
    time: FormControl<number>
  }> = this.fb.group({
    time: [null as number, Validators.required]
  });

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private volumeService: VolumeService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private fb: NonNullableFormBuilder) {
    this.volumeStatus = new Map<String, string>();
    this.volumeStatus.set('KHOITAO', 'Đang hoạt động');
    this.volumeStatus.set('ERROR', 'Lỗi');
    this.volumeStatus.set('SUSPENDED', 'Tạm ngừng');
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id
    // this.getListVolumes()
  }

  navigateEditVolume(idVolume: number) {
    this.router.navigate(['/app-smart-cloud/volume/edit/' + idVolume]);
  }

  getVolumeById(id) {
    this.volumeService.getVolummeById(id).subscribe(data => {
      this.volumeInfo = data
      if (data.attachedInstances != null) {
        this.attachedDto = data.attachedInstances;
      }

      if (this.attachedDto.length > 1) {
        this.attachedDto.forEach(vm => {
          this.listVMs += vm.instanceName + '\n';
        })
      }
    })
  }



  ngOnInit(): void {
    this.idVolume = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getVolumeById(this.idVolume);
  }


}
