import {Component, Input} from '@angular/core';

@Component({
  selector: 'one-portal-json-viewer',
  templateUrl: './json-viewer.component.html',
})
export class JsonViewerComponent {
  @Input() value: {}

  get code() {
    return JSON.stringify(this.value, null, 2);
  }

  set code(v) {
    try {
      this.value = JSON.parse(v);
    } catch (e) {
      console.log('error occored while you were typing the JSON');
    }
  }
}
