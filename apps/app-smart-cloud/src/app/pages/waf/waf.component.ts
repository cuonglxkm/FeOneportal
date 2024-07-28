import { Component, OnInit } from '@angular/core';

export class WafDTO{
  name:string;
  package:string;
  begin:Date;
  end:Date;
  status:string;
}

@Component({
  selector: 'app-waf',
  templateUrl: './waf.component.html',
})

export class WafComponent implements OnInit {
  constructor() {
    
  }
  ngOnInit() {
    
  }
}
