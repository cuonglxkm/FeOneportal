import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';

import { LazyService } from '@core/services/common/lazy.service';
import { PageHeaderType } from '@app/core/models/interfaces/page';

declare var BMap: any;
@Component({
  selector: 'app-baidu-map',
  templateUrl: './baidu-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaiduMapComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: "Baidu map, don't reveal your whereabouts",
    breadcrumb: ['Home', 'Features', 'Chart', 'Baidu Maps']
  };

  constructor(private lazyService: LazyService) {}

  ngOnInit(): void {
    this.lazyService.loadScript('http://api.map.baidu.com/getscript?v=2.0&ak=RD5HkkjTa6uAIDpw7GRFtR83Fk7Wdk0j').then(() => {
      const map = new BMap.Map('map'); //Create a map instance
      const point = new BMap.Point(116.404, 39.915); // create point coordinates
      map.centerAndZoom(point, 15); //Initialize the map, set the center point coordinates and map level
      map.enableScrollWheelZoom(true); //Enable mouse wheel zoom
    });
  }
}
