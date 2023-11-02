import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';

// import { ip, port } from '@env/environment.prod';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import { webSocket } from 'rxjs/webSocket';

@Component({
  selector: 'app-websocket',
  templateUrl: './websocket.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebsocketComponent implements OnInit, OnDestroy {
  concate = true;
  // https://github.com/ReactiveX/rxjs/issues/4166
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'websocket',
    breadcrumb: ['Home', 'Features', 'Websocket']
  };
  // subject = webSocket(`ws://${ip}:8003/webSocket`);
  result: string[] = [];
  msg = '';

  constructor(private cdr: ChangeDetectorRef) {}

  send(): void {
    // this.subject.next(this.msg);
    this.msg = '';
  }

  end(): void {
    // this.subject.complete();
    this.concate = false;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // this.subject.subscribe(res => {
    //   // @ts-ignore
    //   this.result.push(res.message);
    //   this.result = [...this.result];
    //   this.cdr.markForCheck();
    // });
  }

  ngOnDestroy(): void {
    // this.subject.complete();
  }
}
