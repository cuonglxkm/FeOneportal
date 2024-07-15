import {Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

interface HeaderInfo {
  breadcrumb1: string;
  breadcrumb2: string;
  breadcrumb3: string;
  content: string;
}

@Component({
  selector: 'app-header-volume',
  templateUrl: 'header-volume.component.html',
})
export class HeaderVolumeComponent implements OnInit {
  @Input() headerInfo: HeaderInfo;

  @Output() regionId = new EventEmitter<number>;
  @Output() projectId = new EventEmitter<number>;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {

  }

  ngOnInit(): void {
  }

  selectedRegion: number = null;
  selectedProject: number = null;

  onRegionChange(region: RegionModel) {
    this.selectedRegion = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.regionId.emit(region.regionId);
  }

  onProjectChange(project: ProjectModel){
    this.selectedProject = project.id;
    this.projectId.emit(project.id);
  }

}
