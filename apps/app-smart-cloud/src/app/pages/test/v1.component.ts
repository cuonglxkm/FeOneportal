import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import type {Chart} from '@antv/g2';
import {OnboardingService} from '@delon/abc/onboarding';
import {_HttpClient} from '@delon/theme';
import {NzSafeAny} from 'ng-zorro-antd/core/types';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {RegionModel} from "../../shared/models/region.model";
import {HttpClient} from "@angular/common/http";
import {ProjectModel} from "../../shared/models/project.model";
import { JsonEditorOptions } from '@maaxgr/ang-jsoneditor';
@Component({
  selector: 'app-dashboard-v1',
  templateUrl: 'v1.component.html',
})
export class V1Component implements OnInit {

  someObject = {
    name: 'thanh',
    age: 20,
    test: {
      name: 'test',
      age: 30
    }
  }

  public editorOptions: JsonEditorOptions;
  public initialData: any;
  public visibleData: any;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private http: HttpClient) {

    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.modes = ['code', 'text', 'tree', 'view'];

    this.initialData = {"products":[{"name":"car","product":[{"name":"honda","model":[{"id":"civic","name":"civic"},{"id":"accord","name":"accord"},{"id":"crv","name":"crv"},{"id":"pilot","name":"pilot"},{"id":"odyssey","name":"odyssey"}]}]}]}
    this.visibleData = this.initialData;
  }

  ngOnInit(): void {
  }

  selectedRegion: number = null;

  onRegionChange(region: RegionModel) {
    this.selectedRegion = region.regionId;
    console.log(region)
  }

  onProjectChange(projectModel: ProjectModel) {
    console.log(projectModel)
  }

  showJson(d: Event) {
    this.visibleData = d;
  }
}
