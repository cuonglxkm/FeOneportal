import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'one-portal-instances-console',
  templateUrl: './instances-console.component.html',
  styleUrls: ['./instances-console.component.less'],
})
export class InstancesConsoleComponent implements AfterViewInit {

  src: string = 'https://192.168.30.10:6080/vnc_auto.html?path=%3Ftoken%3D72cdab7b-18c4-4ffa-837e-10b521c0a107'; // <- YOUR URL
  @ViewChild('iframe') iframe: ElementRef;

  ngAfterViewInit() {
    const doc = this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentElement.contentWindow;
    const content = `
       <html>
       <head>
         <base target="_parent">
       </head>
       <body>
       <script type="text/javascript" src="${this.src}"></script>
       </body>
     </html>
   `;

    doc.open();
    doc.write(content);
    doc.close();
  }

}
