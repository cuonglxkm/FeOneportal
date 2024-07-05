import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';



@Component({
  selector: 'bottom-bar', 
  templateUrl: './bottombar.component.html',
  styleUrls: ['./bottombar.component.css'],
})
export class BottombarComponent implements OnInit, AfterViewInit {
  @Input() position: number = 0;
  @Input() bgColor: string = '#ffffff';

  @ViewChild('btbar')
  public btbar!: ElementRef;
  @ViewChild('btbarwr')
  public btbarwr!: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    setTimeout(() => {
      this.renderer.setStyle(
        this.btbarwr.nativeElement,
        'width',
        this.btbar.nativeElement.offsetWidth + 'px'
      );
      this.renderer.setStyle(
        this.btbarwr.nativeElement,
        'bottom',
        this.position + 'px'
      );
    }, 200);
  }

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.renderer.setStyle(
        this.btbarwr.nativeElement,
        'width',
        this.btbar.nativeElement.offsetWidth + 'px'
      );
      this.renderer.setStyle(
        this.btbarwr.nativeElement,
        'bottom',
        this.position + 'px'
      );
    }, 200);
  }
}
