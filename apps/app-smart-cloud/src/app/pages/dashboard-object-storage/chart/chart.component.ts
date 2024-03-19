import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Summary } from '../../../shared/models/object-storage.model';
import { Line } from '@antv/g2plot';
import { Chart } from '@antv/g2';

@Component({
  selector: 'one-portal-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less']
})
export class ChartComponent implements AfterViewInit{
  @Input() summary: Summary[];
  newDate: Date = new Date();

  isLoaded: boolean = false;

  @ViewChild('iframe') iframeEle: ElementRef;

  createChartStorageUse() {
    const data = [
      { year: '1991', value: 3 },
      { year: '1992', value: 4 },
      { year: '1993', value: 3.5 },
      { year: '1994', value: 5 },
      { year: '1995', value: 4.9 },
      { year: '1996', value: 6 },
      { year: '1997', value: 7 },
      { year: '1998', value: 9 },
      { year: '1999', value: 13 }
    ];

    const line = new Line('storage-use', {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  createNumberObject() {
    const data = [
      { year: '1991', value: 3 },
      { year: '1992', value: 4 },
      { year: '1993', value: 3.5 },
      { year: '1994', value: 5 },
      { year: '1995', value: 4.9 },
      { year: '1996', value: 6 },
      { year: '1997', value: 7 },
      { year: '1998', value: 9 },
      { year: '1999', value: 13 }
    ];
    const line = new Line('number-object', {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  createStorageUpload() {
    const data = [
      { year: '1991', value: 3 },
      { year: '1992', value: 4 },
      { year: '1993', value: 3.5 },
      { year: '1994', value: 5 },
      { year: '1995', value: 4.9 },
      { year: '1996', value: 6 },
      { year: '1997', value: 7 },
      { year: '1998', value: 9 },
      { year: '1999', value: 13 }
    ];
    const line = new Line('storage-upload', {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }

  createStorageDownload() {
    const data = [
      { year: '1991', value: 3 },
      { year: '1992', value: 4 },
      { year: '1993', value: 3.5 },
      { year: '1994', value: 5 },
      { year: '1995', value: 4.9 },
      { year: '1996', value: 6 },
      { year: '1997', value: 7 },
      { year: '1998', value: 9 },
      { year: '1999', value: 13 }
    ];
    const line = new Line('storage-download', {
      data,
      xField: 'year',
      yField: 'value'
    });

    line.render();
  }


  downloadImagePng(type): void {
    const imgUrl = 'assets/imgs/' + type + '.png'; // Thay đổi đường dẫn tới hình ảnh của bạn
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = type + '.png'; // Tên tệp tải xuống
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadImageJpg(type): void {
    const imgUrl = 'assets/imgs/' + type + '.jpg'; // Thay đổi đường dẫn tới hình ảnh của bạn
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = type + '.jpg'; // Tên tệp tải xuống
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadPDF(type): void {
    const pdfUrl = 'assets/imgs/' + type + '.pdf'; // Thay đổi đường dẫn tới tài liệu PDF của bạn
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = type + '.pdf'; // Tên tệp tải xuống
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadSVG(type): void {
    const svgUrl = 'assets/imgs/' + type + '.svg'; // Thay đổi đường dẫn tới hình ảnh SVG của bạn
    const link = document.createElement('a');
    link.href = svgUrl;
    link.download = type + '.svg'; // Tên tệp tải xuống
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onClickFullScreen() {
    // this.fullContentService.toggle();
    this.iframeEle.nativeElement.requestFullscreen();
    this.iframeEle.nativeElement.focus();
  }

  loadingComplete(event: any) {
    this.isLoaded = true;
    event.target.contentWindow.focus();
  }


  // downloadImage(chart: Chart, name: string = 'G2Chart') {
  //   const link = document.createElement('a');
  //   const renderer = chart.renderer;
  //   const filename = `${name}${renderer === 'svg' ? '.svg' : '.png'}`;
  //   const canvas = chart.getCanvas();
  //   canvas.get('timeline').stopAllAnimations();
  //
  //   setTimeout(() => {
  //     const dataURL = this.toDataURL(chart);
  //     if (window.Blob && window.URL && renderer !== 'svg') {
  //       const arr = dataURL.split(',');
  //       const mime = arr[0].match(/:(.*?);/)[1];
  //       const bstr = atob ( arr [ 1 ] ) ;
  //       let n = bstr.length;
  //       const u8arr = new Uint8Array(n);
  //       while (n--) {
  //         u8arr[n] = bstr.charCodeAt(n);
  //       }
  //       const blobObj = new Blob([u8arr], { type: mime });
  //       if (window.navigator.msSaveBlob) {
  //         window.navigator.msSaveBlob(blobObj, filename);
  //       } else {
  //         link.addEventListener('click', () => {
  //           link.download = filename;
  //           link.href = window.URL.createObjectURL(blobObj);
  //         } ) ;
  //       }
  //     }else{
  //       link.addEventListener('click', () => {
  //         link.download = filename;
  //         link.href = dataURL;
  //       } ) ;
  //     }
  //     const e = document.createEvent('MouseEvents');
  //     e.initEvent('click', false, false);
  //     link.dispatchEvent(e);
  //   } , 16 ) ;
  // }

  // toDataURL(chart: Chart) {
  //   const canvas = chart.getCanvas();
  //   const renderer = chart.renderer;
  //   const canvasDom = canvas . get ( 'the' ) ;
  //   let dataURL = '';
  //   if (renderer === 'svg') {
  //     const clone = canvasDom.cloneNode(true);
  //     const svgDocType = document.implementation.createDocumentType(
  //       'svg',
  //       '-//W3C//DTD SVG 1.1//EN' ,
  //       'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'
  //     ) ;
  //     const svgDoc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', svgDocType);
  //     svgDoc.replaceChild(clone, svgDoc.documentElement);
  //     const svgData = new XMLSerializer().serializeToString(svgDoc);
  //     dataURL = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svgData);
  //   } else if (renderer === 'canvas') {
  //     dataURL = canvasDom.toDataURL('image/png');
  //   }
  //   return dataURL;
  // }

  ngAfterViewInit(): void {
    this.createChartStorageUse();
    this.createNumberObject();
    this.createStorageUpload();
    this.createStorageDownload();
  }
}
