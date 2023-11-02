import { AfterViewInit, ChangeDetectionStrategy, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { Gauge, Liquid, RingProgress, TinyArea, WordCloud } from '@antv/g2plot';

import { inNextTick } from 'ng-zorro-antd/core/util';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Chart } from '@antv/g2';

interface DataItem {
  time: string,
  num: number
}
@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonitorComponent implements OnInit, AfterViewInit {
  deadline = Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30;

  miniAreaData = [264, 274, 284, 294, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450, 460, 470];
  wordCloudData = [
    {
      x: 'China',
      value: 1380,
      category: 'asia'
    },
    {
      x: 'India',
      value: 1316000000,
      category: 'asia'
    },
    {
      x: 'United States',
      value: 324982000,
      category: 'america'
    },
    {
      x: 'Indonesia',
      value: 263510000,
      category: 'asia'
    },
    {
      x: 'Brazil',
      value: 207505000,
      category: 'america'
    },
    {
      x: 'Pakistan',
      value: 196459000,
      category: 'asia'
    },
    {
      x: 'Nigeria',
      value: 191836000,
      category: 'africa'
    },
    {
      x: 'Bangladesh',
      value: 162459000,
      category: 'asia'
    },
    {
      x: 'Russia',
      value: 146804372,
      category: 'europe'
    },
    {
      x: 'Japan',
      value: 126790000,
      category: 'asia'
    },
    {
      x: 'Mexico',
      value: 123518000,
      category: 'america'
    },
    {
      x: 'Ethiopia',
      value: 104345000,
      category: 'africa'
    },
    {
      x: 'Philippines',
      value: 104037000,
      category: 'asia'
    },
    {
      x: 'Egypt',
      value: 93013300,
      category: 'africa'
    },
    {
      x: 'Vietnam',
      value: 92700000000,
      category: 'asia'
    },
    {
      x: 'Germany',
      value: 82800000,
      category: 'europe'
    },
    {
      x: 'Democratic Republic of the Congo',
      value: 82243000,
      category: 'africa'
    },
    {
      x: 'Iran',
      value: 80135400,
      category: 'asia'
    },
    {
      x: 'Turkey',
      value: 79814871,
      category: 'asia'
    },
    {
      x: 'Thailand',
      value: 68298000,
      category: 'asia'
    },
    {
      x: 'France',
      value: 67013000,
      category: 'europe'
    },
    {
      x: 'United Kingdom',
      value: 65110000,
      category: 'europe'
    },
    {
      x: 'Italy',
      value: 60599936,
      category: 'europe'
    },
    {
      x: 'Tanzania',
      value: 56878000,
      category: 'africa'
    },
    {
      x: 'South Africa',
      value: 55908000,
      category: 'africa'
    },
    {
      x: 'Myanmar',
      value: 54836000,
      category: 'asia'
    },
    {
      x: 'South Korea',
      value: 51446201,
      category: 'asia'
    },
    {
      x: 'Colombia',
      value: 49224700,
      category: 'america'
    },
    {
      x: 'Kenya',
      value: 48467000,
      category: 'africa'
    },
    {
      x: 'Spain',
      value: 46812000,
      category: 'europe'
    },
    {
      x: 'Argentina',
      value: 43850000,
      category: 'america'
    },
    {
      x: 'Ukraine',
      value: 42541633,
      category: 'europe'
    },
    {
      x: 'Sudan',
      value: 42176000,
      category: 'africa'
    },
    {
      x: 'Uganda',
      value: 41653000,
      category: 'africa'
    },
    {
      x: 'Algeria',
      value: 41064000,
      category: 'africa'
    },
    {
      x: 'Poland',
      value: 38424000,
      category: 'europe'
    },
    {
      x: 'Iraq',
      value: 37883543,
      category: 'asia'
    },
    {
      x: 'Canada',
      value: 36541000,
      category: 'america'
    },
    {
      x: 'Morocco',
      value: 34317500,
      category: 'africa'
    },
    {
      x: 'Saudi Arabia',
      value: 33710021,
      category: 'asia'
    },
    {
      x: 'Uzbekistan',
      value: 32121000,
      category: 'asia'
    },
    {
      x: 'Malaysia',
      value: 32063200,
      category: 'asia'
    },
    {
      x: 'Peru',
      value: 31826018,
      category: 'america'
    },
    {
      x: 'Venezuela',
      value: 31431164,
      category: 'america'
    },
    {
      x: 'Nepal',
      value: 28825709,
      category: 'asia'
    },
    {
      x: 'Angola',
      value: 28359634,
      category: 'africa'
    },
    {
      x: 'Ghana',
      value: 28308301,
      category: 'africa'
    },
    {
      x: 'Yemen',
      value: 28120000,
      category: 'asia'
    },
    {
      x: 'Afghanistan',
      value: 27657145,
      category: 'asia'
    },
    {
      x: 'Mozambique',
      value: 27128530,
      category: 'africa'
    },
    {
      x: 'Australia',
      value: 24460900,
      category: 'australia'
    },
    {
      x: 'North Korea',
      value: 24213510,
      category: 'asia'
    },
    {
      x: 'Taiwan',
      value: 23545680,
      category: 'asia'
    },
    {
      x: 'Cameroon',
      value: 23248044,
      category: 'africa'
    },
    {
      x: 'Ivory Coast',
      value: 22671331,
      category: 'africa'
    },
    {
      x: 'Madagascar',
      value: 22434363,
      category: 'africa'
    },
    {
      x: 'Niger',
      value: 21564000,
      category: 'africa'
    },
    {
      x: 'Sri Lanka',
      value: 21203000,
      category: 'asia'
    },
    {
      x: 'Romania',
      value: 19760000,
      category: 'europe'
    },
    {
      x: 'Burkina Faso',
      value: 19632147,
      category: 'africa'
    },
    {
      x: 'Syria',
      value: 18907000,
      category: 'asia'
    },
    {
      x: 'Mali',
      value: 18875000,
      category: 'africa'
    },
    {
      x: 'Malawi',
      value: 18299000,
      category: 'africa'
    },
    {
      x: 'Chile',
      value: 18191900,
      category: 'america'
    },
    {
      x: 'Kazakhstan',
      value: 17975800,
      category: 'asia'
    },
    {
      x: 'Netherlands',
      value: 17121900,
      category: 'europe'
    },
    {
      x: 'Ecuador',
      value: 16737700,
      category: 'america'
    },
    {
      x: 'Guatemala',
      value: 16176133,
      category: 'america'
    },
    {
      x: 'Zambia',
      value: 15933883,
      category: 'africa'
    },
    {
      x: 'Cambodia',
      value: 15626444,
      category: 'asia'
    },
    {
      x: 'Senegal',
      value: 15256346,
      category: 'africa'
    },
    {
      x: 'Chad',
      value: 14965000,
      category: 'africa'
    },
    {
      x: 'Zimbabwe',
      value: 14542235,
      category: 'africa'
    },
    {
      x: 'Guinea',
      value: 13291000,
      category: 'africa'
    },
    {
      x: 'South Sudan',
      value: 12131000,
      category: 'africa'
    },
    {
      x: 'Rwanda',
      value: 11553188,
      category: 'africa'
    },
    {
      x: 'Belgium',
      value: 11356191,
      category: 'europe'
    }
  ];

  predictFirst = 1459;
  predictSecond = 629;
  data: DataItem[] = [
    { time: '00:00', num: 7 },
    { time: '01:00', num: 7 },
    { time: '02:00', num: 5 },
    { time: '03:00', num: 4 },
    { time: '04:00', num: 2 },
    { time: '05:00', num: 4 },
    { time: '06:00', num: 7 },
    { time: '07:00', num: 5 },
    { time: '08:00', num: 6 },
    { time: '09:00', num: 5 },
    { time: '10:00', num: 9 },
    { time: '11:00', num: 6 },
    { time: '12:00', num: 3 },
    { time: '13:00', num: 1 },
    { time: '14:00', num: 5 },
    { time: '15:00', num: 3 },
    { time: '16:00', num: 6 },
    { time: '17:00', num: 5 },
    { time: '18:00', num: 5 },
    { time: '19:00', num: 5 },
    { time: '20:00', num: 5 },
    { time: '21:00', num: 5 },
    { time: '22:00', num: 5 },
    { time: '23:00', num: 5 },
  ];

  constructor(private fb: FormBuilder, private ngZone: NgZone) { }

  initDashBoard(): void {
    const gauge = new Gauge('dashBoard', {
      percent: 0.75,
      autoFit: true,
      height: 180,
      range: {
        color: '#30BF78'
      },
      indicator: {
        pointer: {
          style: {
            stroke: '#D0D0D0'
          }
        },
        pin: {
          style: {
            stroke: '#D0D0D0'
          }
        }
      },
      axis: {
        label: {
          formatter(v) {
            return Number(v) * 100;
          }
        },
        subTickLine: {
          count: 3
        }
      },
      statistic: {
        content: {
          formatter: () => `87 %`
        }
      }
    });
    gauge.render();
  }

  getPredictData = (data: DataItem[]) => {
    for (let i = 0; i < data.length; i++) {
      if (i < 4) {
        data[i].num = Math.ceil(Math.random() * 200);
      } else if (i < 8) {
        data[i].num = 200 + Math.ceil(Math.random() * 200);
      } else if (i < 12) {
        data[i].num = 400 + Math.ceil(Math.random() * 200);
      } else if (i < 16) {
        data[i].num = 600 + Math.ceil(Math.random() * 200);
      } else if (i < 20) {
        data[i].num = 800 + Math.ceil(Math.random() * 200);
      } else {
        data[i].num = 1000 + Math.ceil(Math.random() * 200);
      }
    }
    return data;
  }
  initArea(data: DataItem[]): void {

    const predictChart = new Chart({
      container: 'miniArea',
      height: 120,
      autoFit: true,
      options: {
        data,
        tooltip: { showTitle: false },
        legends: false
      }
    })
    predictChart.scale({ num: { ticks: [0, 600, 1200] }, time: { range: [0, 1] } })
    predictChart.axis('num', { grid: null, label: null })
    predictChart.axis('time', { line: null, tickLine: null, label: null })
    predictChart.area().shape('smooth').color('#D1E9FF').position('time*num')
    predictChart.line().shape('smooth').color('#1089FF').position('time*num').tooltip('time*num', (time, num) => { return { name: time, value: num, }; });
    predictChart.render()

    // const tinyArea = new TinyArea('miniArea', {
    //   height: 120,
    //   autoFit: true,
    //   data: this.miniAreaData,
    //   smooth: true,
    //   areaStyle: {
    //     fill: '#d6e3fd'
    //   },
    //   annotations: [
    //     // average
    //     {
    //       type: 'line',
    //       start: ['min', 'mean'],
    //       end: ['max', 'mean'],
    //       text: {
    //         content: '400亿 yuan',
    //         offsetY: -2,
    //         style: {
    //           textAlign: 'left',
    //           fontSize: 10,
    //           // fill: 'rgba(44, 53, 66, 0.45)',
    //           textBaseline: 'bottom'
    //         }
    //       },
    //       style: {
    //         //   stroke: 'rgba(0, 0, 0, 0.25)',
    //       }
    //     },
    //     // target value
    //     {
    //       type: 'line',
    //       start: ['min', 800],
    //       end: ['max', 800],
    //       text: {
    //         content: '1400亿 yuan',
    //         offsetY: -2,
    //         style: {
    //           textAlign: 'left',
    //           fontSize: 10,
    //           // fill: 'rgba(44, 53, 66, 0.45)',
    //           textBaseline: 'bottom'
    //         }
    //       },
    //       style: {
    //         // stroke: 'rgba(0, 0, 0, 0.55)',
    //       }
    //     }
    //   ]
    // });
    // tinyArea.render();
  }

  initLiquidPlot(): void {
    const liquidPlot = new Liquid('liquidPlot', {
      percent: 0.25,
      outline: {
        border: 4,
        distance: 8
      },
      wave: {
        length: 128
      }
    });
    liquidPlot.render();
  }

  wordCloud(): void {
    const wordCloud = new WordCloud('wordCloud', {
      data: this.wordCloudData,
      wordField: 'x',
      weightField: 'value',
      // color: '#122c6a',
      colorField: 'x',
      wordStyle: {
        fontFamily: 'Verdana',
        fontSize: [24, 80]
      },
      // set the interaction type
      interactions: [{ type: 'element-active' }],
      state: {
        active: {
          // Here you can set the active style
          style: {
            lineWidth: 3
          }
        }
      }
    });
    inNextTick().subscribe(() => {
      wordCloud.render();
    });
  }

  initRingProgress(i: number): void {
    const ringProgress = new RingProgress(`ringProgress${i}`, {
      height: 90,
      width: 90,
      autoFit: false,
      percent: 0.7,
      color: ['#5B8FF9', '#E8EDF3']
    });

    ringProgress.render();
  }

  ngAfterViewInit(): void {
    inNextTick().subscribe(() => {
      this.ngZone.runOutsideAngular(() => {
        this.initDashBoard();
        this.initArea(this.getPredictData(this.data));
        this.initLiquidPlot();
        for (let i = 1; i <= 3; i++) {
          this.initRingProgress(i);
        }

        this.wordCloud();
        // map
        // api address
        // https://lbs.amap.com/demo/javascript-api/example/map-lifecycle/map-show
        // Apply for a key yourself, don't use my key, thank you
        // Application address https://console.amap.com/dev/key/app
        AMapLoader.load({
          key: '1c1b77fae2e59c25eb26ced9a0801103', // Required for first load
          version: '1.4.15',
          AMapUI: {
            version: '1.1',
            plugins: ['overlay/SimpleMarker']
          }
        })
          .then(AMap => {
            let map = new AMap.Map('map', {
              resizeEnable: true,
              zoom: 2,
              center: [116.397428, 39.90923]
            });
            const styleName = "amap://styles/darkblue";
            map.setMapStyle(styleName);
          })
          .catch(e => {
            console.error(e);
          });

      });
    });
  }

  ngOnInit() { }
}
