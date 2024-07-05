import {Component, EventEmitter, Input, Output} from '@angular/core';
import { RegionModel, ProjectModel } from '../../../../../../libs/common-utils/src';

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

    regionChanged(region: RegionModel) {
        this.onRegionChanged.emit(region)
    }

    onRegionChange(region: RegionModel) {
        this.regionId = region.regionId;
      }

    projectChanged(project: ProjectModel) {
        this.onProjectChanged.emit(project)
    }
}
