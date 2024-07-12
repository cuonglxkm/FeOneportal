import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
  selector: 'one-portal-svg-icon',
  templateUrl: './svg-icon.component.html',
})

export class SvgIconComponent implements OnInit{
  @Input() icon!: string;
  @Input() tooltip: string;
  
  constructor() {
  }

  
  ngOnInit(): void {
    
  }
}
