import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { VolumeService } from 'src/app/shared/services/volume.service';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { VolumeDTO } from 'src/app/shared/dto/volume.dto';

@Component({
  selector: 'one-portal-vpn-connection',
  templateUrl: './vpn-connection.component.html',
  styleUrls: ['./vpn-connection.component.less']
})

export class VpnConnection {

}
