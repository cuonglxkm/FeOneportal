import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

interface Header {
  firstItem: string
  secondItem: string
  thirdItem: string
  content: string
}
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
