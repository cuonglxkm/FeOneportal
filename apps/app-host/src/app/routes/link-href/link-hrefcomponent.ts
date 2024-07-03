import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'one-portal-link-href',
  templateUrl: './link-href.component.html',
  styleUrls: ['./link-href.component.less'],
})
export class LinkHrefComponent implements OnInit {
  ngOnInit(): void {
    window.location.href = 'https://vnptcloud.onsmartcloud.com/'
  }
}
