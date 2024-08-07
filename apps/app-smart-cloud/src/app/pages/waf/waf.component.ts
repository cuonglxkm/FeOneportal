import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    private wafService: WafService,
    private router: Router) {
    
  }
  ngOnInit() {
    this.wafService.hasWaf().subscribe({next:(data)=>{
      if(data){
        this.isBegin = false;
      }
    },error:(err)=>{
      
    }})
  }
  navigateToCreateWaf() {
    this.router.navigate(['/app-smart-cloud/waf/create']);
  }
}
