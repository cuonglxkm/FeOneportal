import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FullContentService} from "@delon/abc/full-content";
import {HttpClient} from "@angular/common/http";
import {LoadingService, LoadingType} from "@delon/abc/loading";
import {finalize} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'one-portal-instances-console',
  templateUrl: './instances-console.component.html',
  styleUrls: ['./instances-console.component.less'],
})
export class InstancesConsoleComponent implements OnInit, AfterViewInit {
  src: string = 'https://192.168.30.10:6080/vnc_auto.html?path=%3Ftoken%3D72cdab7b-18c4-4ffa-837e-10b521c0a107'; // <- YOUR URL
  scroll = {y: '230px'};
  isFull: boolean = false;

  vmId: any;

  constructor(
    private fullContentService: FullContentService,
    private http: HttpClient,
    private loadingSrv: LoadingService, private route: ActivatedRoute) {
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
    this.fullContentService.toggle()
  }

  getUrl() {
    this.loadingSrv.open({type: "spin", text: "Loading..."});
    this.http.get(`http://172.16.68.200:1009/instances/${this.vmId}/console`).pipe(
      finalize(() => this.loadingSrv.close())
    )
      .subscribe(res => {
        this.src = res['url'];
      })
  }


}
