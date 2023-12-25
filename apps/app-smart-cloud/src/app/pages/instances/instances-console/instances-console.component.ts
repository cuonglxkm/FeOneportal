import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FullContentService} from "@delon/abc/full-content";
import {HttpClient} from "@angular/common/http";
import {LoadingService, LoadingType} from "@delon/abc/loading";
import {finalize} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {InstancesService} from "../instances.service";

@Component({
  selector: 'one-portal-instances-console',
  templateUrl: './instances-console.component.html',
  styleUrls: ['./instances-console.component.less'],
})
export class InstancesConsoleComponent implements OnInit, AfterViewInit {
  src: string = ''; // <- YOUR URL
  scroll = {y: '230px'};
  isFull: boolean = false;
  vmId: any;
  isLoaded = false;
  @ViewChild('iframe') iframeEle: ElementRef;

  constructor(
    private fullContentService: FullContentService,
    private http: HttpClient,
    private loadingSrv: LoadingService,
    private route: ActivatedRoute,
    private service: InstancesService) {
  }


  ngOnInit(): void {
    this.vmId = this.route.snapshot.paramMap.get('id');
    this.getUrl();
  }

  ngAfterViewInit() {

  }

  fullChange(val: boolean): void {
    this.isFull = val;
    this.scroll = val ? {y: '350px'} : {y: '230px'};
  }

  onClickFullScreen() {
    this.fullContentService.toggle();
    this.iframeEle.nativeElement.focus();
  }

  getUrl() {
    this.loadingSrv.open({type: "spin", text: "Loading..."});
    this.service.getConsoleUrl(this.vmId).pipe(
      finalize(() => this.loadingSrv.close())
    )
      .subscribe(res => {
        this.src = res['url'];
      })
  }

  loadingComplete(event: any) {
    this.isLoaded = true;
    event.target.contentWindow.focus()
  }

}
