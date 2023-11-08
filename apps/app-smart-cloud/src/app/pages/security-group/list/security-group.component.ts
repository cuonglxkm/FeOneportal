import { HttpClient } from '@angular/common/http';
import {Component, OnInit} from '@angular/core';

interface Security {
  id: number;
  name: string;
  desc: string;
}

interface Inbound {
  ip_version: string;
  protocol: string;
  port_range: string;
  remote: string;
}

interface Area {
  id: number;
  name: string;
  desc: string;
}
interface Project {
  id: number;
  name: string;
  desc: string;
}

@Component({
  selector: 'one-portal-security-group',
  templateUrl: './security-group.component.html',
  styleUrls: ['./security-group.component.less'],
})
export class SecurityGroupComponent implements OnInit{
  constructor(private http: HttpClient) {
  }

  selectedValue?: Security;
  options: Security[] = [
    { name: 'Security 1', id: 1, desc: '' },
    { name: 'Security 2', id: 2, desc:''},
    { name: 'Security 3', id: 3, desc:"" },
  ];

  selectedValueArea?: Area;
  optionsArea: Area[] = [
    { name: 'Khu vực 1', id: 1, desc: '' },
    { name: 'Khu vực 2', id: 2, desc:''},
    { name: 'Khu vực 3', id: 3, desc:"" },
  ];

  selectedValueProject?: Project;
  optionsProject: Project[] = [
    { name: 'Dự án 1', id: 1, desc: '' },
    { name: 'Dự án 2', id: 2, desc:''},
    { name: 'Dự án 3', id: 3, desc:"" },
  ]

  listSecurityGroup: Object = [];

  listInbound: Inbound[] = [
    { ip_version: 'ipV4', protocol: 'tcp', port_range: '1', remote: 'Test 1'},
    { ip_version: 'ipV4', protocol: 'tcp', port_range: '2', remote: 'Test 1'},
    { ip_version: 'ipV4', protocol: 'tcp', port_range: '2', remote: 'Test 1'},
    { ip_version: 'ipV4', protocol: 'tcp', port_range: '3', remote: 'Test 1'},
    { ip_version: 'ipV4', protocol: 'tcp', port_range: '3', remote: 'Test 1'},
  ]
  onSelectChange(): void {
    console.log('Selected value: ' + this.selectedValue);
  }

  isVisible = false;
  isConfirmLoading = false;
  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isConfirmLoading = true;
    setTimeout(() => {
      this.isVisible = false;
      this.isConfirmLoading = false;
    }, 3000);
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  getSecurityGroup() {
    this.http.get("http://172.16.68.200:1009/security_group/get_all")
        .subscribe(listSecurityGroup => this.listSecurityGroup = listSecurityGroup)
  }

  getInstances() {
    this.http.get("")
  }
  ngOnInit() {}
}
