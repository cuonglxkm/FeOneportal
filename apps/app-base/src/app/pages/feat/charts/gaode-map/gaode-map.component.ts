import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit } from '@angular/core';

import AMapLoader from '@amap/amap-jsapi-loader';
import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-gaode-map',
  templateUrl: './gaode-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaodeMapComponent implements OnInit, AfterViewInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Gaode Maps, be careful not to expose your whereabouts',
    breadcrumb: ['Home', 'Features', 'Chart', 'Gaode Maps']
  };
  marker: [number, number] = [116.437253, 39.935033];
  markerPosition: string = this.marker.join(',');

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    // api address
    // https://lbs.amap.com/demo/javascript-api/example/map-lifecycle/map-show
    // Apply for a key yourself, don't use my key, thank you
    // Application address https://console.amap.com/dev/key/app
    AMapLoader.load({
      key: '1c1b77fae2e59c25eb26ced9a0801103', //required for the first load
      version: '1.4.15',
      AMapUI: {
        version: '1.1',
        plugins: ['overlay/SimpleMarker']
      }
    })
      .then(AMap => {
        let map = new AMap.Map('container', {
          resizeEnable: true,
          zoom: 11,
          center: [116.397428, 39.90923]
        });

        const marker = new AMap.Marker({
          position: new AMap.LngLat(this.marker[0], this.marker[1]), // longitude and latitude object, or a one-dimensional array of longitude and latitude [116.39, 39.9]
          /*  title: 'Nanjing',*/
          draggable: true
        });
        marker.on('dragend', () => {
          this.marker = [marker.getPosition()['R'], marker.getPosition()['Q']];
          this.markerPosition = this.marker.join(',');
          this.cdr.markForCheck();
          console.log(this.markerPosition);
        });
        marker.setMap(map);
      })
      .catch(e => {
        console.error(e);
      });
  }

  ngOnInit(): void {}
}
