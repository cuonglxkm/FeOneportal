import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RegionModel} from "../../shared/models/region.model";
import {ProjectModel} from "../../shared/models/project.model";

@Component({
    selector: 'one-portal-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less'],
})
export class HeaderComponent {

    @Input() path: string[]

    @Input() title: string

    @Input() regionId: number

    @Output() onRegionChanged = new EventEmitter<RegionModel>;

    @Output() onProjectChanged = new EventEmitter<ProjectModel>;

    regionChanged(region: RegionModel) {
        this.onRegionChanged.emit(region)
    }

    projectChanged(project: ProjectModel) {
        this.onProjectChanged.emit(project)
    }
}
