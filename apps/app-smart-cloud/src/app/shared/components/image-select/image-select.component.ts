import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import Flavor from "../../models/flavor.model";
import {ImageService} from "../../services/image.service";
import Image from "../../models/image";

@Component({
  selector: 'one-portal-image-select',
  templateUrl: './image-select.component.html',
})

export class ImageSelectComponent implements OnInit{

  @Input() value?: Image
  @Input() region?: number
  @Output() onChange = new EventEmitter();

  imageList: Image[] = [];
  constructor(private imageService: ImageService) {
  }

  onSelect(image: Image){
    this.onChange.emit(image);
  }
  getImage() {
    this.imageService.search(this.region).subscribe(data => {
      this.imageList = data;
    })
  }

  ngOnInit(): void {
    this.getImage();
  }
}
