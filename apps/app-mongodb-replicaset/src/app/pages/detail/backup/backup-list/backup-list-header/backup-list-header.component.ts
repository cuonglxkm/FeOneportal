import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-backup-list-header',
  templateUrl: './backup-list-header.component.html',
  styleUrls: ['./backup-list-header.component.css']
})
export class BackupListHeaderComponent implements OnInit {


  @Input("parent-component") parentName: string | undefined;

  @Output() command: EventEmitter<{cmd: string, data: Array<any>}> = new EventEmitter();

  backupTextSearch: string = '';
  backupFilter: number = -1;
  constructor() { }

  ngOnInit(): void {
    
  }

  runCommand(cmd: string) {
    if (cmd == 'search') {
      this.command.emit({cmd, data: [this.backupTextSearch, this.backupFilter]})
    } else if (cmd == 'create-backup') {
      this.command.emit({cmd, data: []});
    }
  }

  onSearch(backupFilter?: number) {
    // if (backupFilter !== undefined) { // event select backupFilter
    //   this.backupFilter = backupFilter;
    // }
    // this.backupTextSearch = this.backupTextSearch.trim();
    // this.runCommand('search');
  }
}
