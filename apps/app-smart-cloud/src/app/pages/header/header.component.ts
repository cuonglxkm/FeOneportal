import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { RegionModel, ProjectModel } from '../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
    selector: 'one-portal-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less'],
})
export class HeaderComponent {

    @Input() path: string[]

    @Input() linkPath: string[]

    @Input() title: string

    @Input() regionId: number

    @Output() onRegionChanged = new EventEmitter<RegionModel>;

    @Output() onProjectChanged = new EventEmitter<ProjectModel>;
    @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
    regionChanged(region: RegionModel) {
        if(this.projectCombobox){
            this.projectCombobox.loadProjects(true, region.regionId);
        }
        this.onRegionChanged.emit(region)
    }

    onRegionChange(region: RegionModel) {
        this.regionId = region.regionId;
      }

    projectChanged(project: ProjectModel) {
        this.onProjectChanged.emit(project)
    }
}
