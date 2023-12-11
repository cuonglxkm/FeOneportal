import {Component, Input} from '@angular/core';
import {JsonEditorOptions} from "@maaxgr/ang-jsoneditor";

@Component({
  selector: 'one-portal-json-viewer',
  templateUrl: './json-viewer.component.html',
})
export class JsonViewerComponent {
  @Input() value: {}

  public editorOptions: JsonEditorOptions;
  public initialData: any;
  public visibleData: any;


  constructor() {
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.modes = ['code', 'text'];

    this.initialData = this.value
    this.visibleData = this.initialData;
  }

  showJson(d: Event) {
    this.visibleData = d;
  }
}
