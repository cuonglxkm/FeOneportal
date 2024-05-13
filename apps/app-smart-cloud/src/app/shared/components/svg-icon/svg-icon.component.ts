import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
  selector: 'app-svg-icon',
  templateUrl: './svg-icon.component.html',
})

export class SvgIconComponent implements OnInit{
  @Input() icon!: string;
  
  constructor() {
  }

  
  ngOnInit(): void {
    
  }
}
