import { Component, OnInit } from '@angular/core';
import { WafService } from 'src/app/shared/services/waf.service';

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
  isBegin = true;
  constructor(
    private wafService: WafService) {
    
  }
  ngOnInit() {
    this.wafService.hasWaf().subscribe({next:(data)=>{
      if(data){
        this.isBegin = false;
      }
    },error:(err)=>{
      
    }})
  }
}
