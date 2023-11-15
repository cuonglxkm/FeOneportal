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
export class HeaderComponent implements OnInit{

  @Input() headerInfo: Header;
  @Output() regionId = new EventEmitter<number>;
  @Output() projectId = new EventEmitter<number>;

  region: number;
  project: number;
  userId: number;
  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.regionId.emit(this.region)
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;
    this.projectId.emit(this.project)
  }

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId
  }
}
