import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, Renderer2} from '@angular/core';
import type {Chart} from '@antv/g2';
import {OnboardingService} from '@delon/abc/onboarding';
import {_HttpClient} from '@delon/theme';
import {NzSafeAny} from 'ng-zorro-antd/core/types';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {RegionModel} from "../../shared/models/region.model";
import {HttpClient} from "@angular/common/http";
import {ProjectModel} from "../../shared/models/project.model";

@Component({
  selector: 'app-dashboard-v1',
  templateUrl: 'v1.component.html',
})
export class V1Component implements OnInit {
  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private http: HttpClient) {

  }

  ngOnInit(): void {

    this.http.get("/test/profile").subscribe(data => {
      console.log(data)
    })

  }

  selectedRegion: number = null;

  onRegionChange(region: RegionModel) {
    this.selectedRegion = region.regionId;
    console.log(region)
  }

  onProjectChange(projectModel: ProjectModel) {
    console.log(projectModel)
  }
}
