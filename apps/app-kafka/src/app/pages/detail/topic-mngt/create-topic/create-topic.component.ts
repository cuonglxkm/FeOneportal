import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { LoadingService } from '@delon/abc/loading';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from "ng-zorro-antd/notification";
import { AppConstants } from 'src/app/core/constants/app-constant';
import { I18NService } from 'src/app/core/i18n/i18n.service';
import { KafkaTopic } from 'src/app/core/models/kafka-topic.model';
import { TopicService } from 'src/app/services/kafka-topic.service';

@Component({
  selector: 'one-portal-create-topic',
  templateUrl: './create-topic.component.html',
  styleUrls: ['./create-topic.component.css'],
})
export class CreateTopicComponent implements OnInit {

  @Input() serviceOrderCode: string;
  @Input() mode: number;
  @Input() data: KafkaTopic;

  @Output() cancelEvent = new EventEmitter<void>();

  listMessVersion: string[] = ["0.8.0", "0.8.1", "0.8.2", "0.9.0", "0.10.0-IV0", "0.10.0-IV1", "0.10.1-IV0", "0.10.1-IV1", "0.10.1-IV2", "0.10.2-IV0", "0.11.0-IV0", "0.11.0-IV1", "0.11.0-IV2", "1.0-IV0", "1.1-IV0", "2.0-IV0", "2.0-IV1", "2.1-IV0", "2.1-IV1", "2.1-IV2", "2.2-IV0", "2.2-IV1", "2.3-IV0", "2.3-IV1", "2.4-IV0", "2.4-IV1", "2.5-IV0", "2.6-IV0", "2.7-IV0", "2.7-IV1", "2.7-IV2", "2.8-IV0", "2.8-IV1", "3.0-IV0", "3.0-IV1", "3.1-IV0", "3.2-IV0", "3.3-IV0", "3.3-IV1", "3.3-IV2", "3.3-IV3", "3.4-IV0", "3.5-IV0", "3.5-IV1", "3.5-IV2"]

  listConfigLabel = [
    { name: 'maxMessage', value: '1048588', type: 'number', fullname: "max.message.bytes" },
    { name: 'policy', value: 'delete', fullname: "cleanup.policy" },
    { name: 'minInsync', value: 2, type: 'number', fullname: "min.insync.replicas" },
    { name: 'unclean_leader', value: 'false', fullname: "unclean.leader.election.enable" },
    { name: 'comp_type', value: 'producer', fullname: "compression.type" },
    { name: 'mess_down_enable', value: 'true', fullname: "message.downconversion.enable" },
    { name: 'segm_jitt', value: '0', type: 'number', fullname: "segment.jitter.ms" },
    { name: 'flush_ms', value: '9007199254740991', type: 'number', fullname: "flush.ms" },
    { name: 'segment', value: '1073741824', type: 'number', fullname: "segment.bytes" },
    { name: 'mess_format', value: '2.7-IV2', fullname: "message.format.version" },
    { name: 'max_comp', value: '9007199254740991', type: 'number', fullname: "max.compaction.lag.ms" },
    { name: 'foll_repl', value: 'none', fullname: "follower.replication.throttled.replicas" },
    { name: 'flush_mess', value: "9007199254740991", type: 'number', fullname: "flush.messages" },
    { name: 'retention_ms', value: 604800000, type: 'number', fullname: "retention.ms" },
    { name: 'file_delete', value: 60000, type: 'number', fullname: "file.delete.delay.ms" },
    { name: 'mess_time_type', value: 'CreateTime', fullname: "message.timestamp.type" },
    { name: 'min_compac', value: 0, type: 'number', fullname: "min.compaction.lag.ms" },
    { name: 'preallocate', value: 'false', fullname: "preallocate" },
    { name: 'min_clean', value: 0.5, type: 'number', fullname: "min.cleanable.dirty.ratio" },
    { name: 'index_inter', value: 4096, type: 'number', fullname: "index.interval.bytes" },
    { name: 'reten_bytes', value: 1073741824, type: 'number', fullname: "retention.bytes" },
    { name: 'segment_ms', value: 604800000, type: 'number', fullname: "segment.ms" },
    { name: 'mess_time_diff', value: "9007199254740991", type: 'number', fullname: "message.timestamp.difference.max.ms" },
    { name: 'deleteRet', value: 86400000, type: 'number', fullname: "delete.retention.ms" },
    { name: 'segm_index', value: 10485760, type: 'number', fullname: "segment.index.bytes" },
    { name: 'lead_rep', value: 'none', fullname: "leader.replication.throttled.replicas" }
  ];

  createNumber = 1;
  updateNumber = 2;
  isSettingAdvanced = false;

  errMessPartition: string;
  errMessRep: string;

  constructor(
    private topicKafkaService: TopicService,
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService,
    private loadingSrv: LoadingService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) { }
  validateForm: FormGroup;

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name_tp: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(255), Validators.pattern(/^[-a-zA-Z0-9]+$/)]],
      partition: [3, [Validators.required, Validators.max(100), Validators.min(1), Validators.pattern(/^\d+$/)]],
      replicaFactor: [3, [Validators.required, Validators.min(1), Validators.max(3), Validators.pattern(/^\d+$/)]],
      maxMessage: [null],
      policy: ["delete"],
      deleteRet: [null],
      minInsync: [null],
      unclean_leader: ["false"],
      re_hours: [null],
      typeTime: [null],
      comp_type: ["producer"],
      mess_down: [true],
      segm_jitt: [0],
      flush_ms: [0],
      segment: [1000000000],
      mess_format: ["2.7-IV2"],
      max_comp: [9.22337E+18],
      foll_repl: [null],
      flush_mess: [null],
      retention_ms: [null],
      file_delete: [null],
      mess_time_type: [null],
      min_compac: [null],
      preallocate: [null],
      min_clean: [null],
      index_inter: [null],
      segment_ms: [null],
      mess_time_diff: [null],
      segm_index: [null],
      mess_down_enable: [null],
      reten_bytes: [null],
      lead_rep: [null]
    });
    this.disableControl();
    if (this.mode == this.updateNumber) {
      this.isSettingAdvanced = true;
      this.validateForm.get('name_tp').disable();
      this.validateForm.get('partition').disable();
      this.validateForm.get('replicaFactor').disable();
      this.validateForm.get('name_tp').setValue(this.data.topicName);
      this.validateForm.get('partition').setValue(this.data.partitions);
      this.validateForm.get('replicaFactor').setValue(this.data.replicas);
      if (this.data.isConfig == 0)
        this.addValidateConfig();
      else {
        this.addValidateCustomConfig(this.data.configs);
      }
    }

  }

  disableControl() {
    const controls = this.validateForm.controls;
    controls.mess_down_enable.disable();
    controls.comp_type.disable();
    controls.segm_jitt.disable();
    controls.foll_repl.disable();
    controls.mess_format.disable();
    controls.preallocate.disable();
    controls.index_inter.disable();
    controls.lead_rep.disable();
    controls.unclean_leader.disable();
    controls.flush_ms.disable();
    controls.flush_mess.disable();
    controls.file_delete.disable();
    controls.min_clean.disable();
    controls.segm_index.disable();
  }

  addValidateCustomConfig(configs: string) {
    
    const jsonObject = JSON.parse(configs);
    this.listConfigLabel.forEach(element => {
      const { name, value, fullname } = element;
      let valueDB = jsonObject[fullname] == null ? value : jsonObject[fullname];
      const validators = [];
      switch (name) {
        case 'lead_rep':
        case 'foll_repl':
          if (valueDB == "null" || valueDB == "none" || valueDB == null || valueDB == "" || valueDB == " ")
            valueDB = 'none';
          break;
        case 'min_clean':
          validators.push(Validators.min(0), Validators.max(1), Validators.pattern(/^\d*(\.\d+)?$/), this.dotValidator);
          break;
        case 'minInsync':
          validators.push(Validators.min(1), Validators.max(3), Validators.pattern(/^\d+$/));
          break;
        case 'reten_bytes':
          validators.push(Validators.min(-1), Validators.max(100000000000), Validators.pattern(/^-?\d+$/));
          break;
        case 'index_inter':
          validators.push(Validators.min(0), Validators.max(2147483647), Validators.pattern(/^\d+$/));
          break;
        case 'file_delete':
          validators.push(Validators.min(0), Validators.max(6000000), Validators.pattern(/^\d+$/))
          break;
        case 'min_compac':
          validators.push(Validators.min(0), Validators.max(1800000), Validators.pattern(/^\d+$/))
          break;
        case 'maxMessage':
          validators.push(Validators.min(1), Validators.max(100000000), Validators.pattern(/^\d+$/))
          break;
        case 'segm_index':
          validators.push(Validators.min(4), Validators.max(2147483647), Validators.pattern(/^\d+$/))
          break;
        case "retention_ms":
          validators.push(Validators.min(-1), Validators.max(9007199254740991), Validators.pattern(/^-?\d+$/))
          break;
        case 'segment_ms':
          validators.push(Validators.min(1), Validators.max(6048000000), Validators.pattern(/^\d+$/))
          break;
        case 'deleteRet':
          validators.push(Validators.min(0), Validators.max(864000000), Validators.pattern(/^\d+$/))
          break;
        case 'segment':
          validators.push(Validators.min(14), Validators.max(2147483647), Validators.pattern(/^\d+$/))
          break;
        case 'flush_mess':
        case 'max_comp':
          validators.push(Validators.min(1), Validators.max(9007199254740991), Validators.pattern(/^\d+$/))
          break;
        case 'mess_time_diff':
        case 'flush_ms':
        case 'segm_jitt':
          validators.push(Validators.min(0), Validators.max(9007199254740991), Validators.pattern(/^\d+$/))
          break;
      }
      
      this.validateForm.get(name).setValue(valueDB ? valueDB : value);
      this.validateForm.get(name).setValidators(validators);
      this.validateForm.get(name).updateValueAndValidity();
    })
  }

  changeSwitch() {
    if (this.isSettingAdvanced)
      this.addValidateConfig()
    else
      this.removeValidatefig()
  }

  dotValidator = (control: FormControl): { [s: string]: boolean } => {
    const value: string = control.value
    if (!control.value) {
      return { error: true, required: true };
    } else if (typeof value === 'string' && (value.startsWith(".") || value.endsWith("."))) {
      return { dot: true, error: true };
    }
    return {};
  };

  addValidateConfig() {
    this.listConfigLabel.forEach(element => {
      const { name, value } = element;
      const validators = [];
      switch (name) {
        case 'min_clean':
          validators.push(Validators.min(0), Validators.max(1), Validators.pattern(/^\d*(\.\d+)?$/), this.dotValidator)
          break;
        case 'minInsync':
          validators.push(Validators.min(1), Validators.max(3), Validators.pattern(/^\d+$/))
          break;
        case 'reten_bytes':
          validators.push(Validators.min(-1), Validators.max(100000000000), Validators.pattern(/^-?\d+$/))
          break;
        case 'index_inter':
          validators.push(Validators.min(0), Validators.max(2147483647), Validators.pattern(/^\d+$/))
          break;
        case 'file_delete':
          validators.push(Validators.min(0), Validators.max(6000000), Validators.pattern(/^\d+$/))
          break;
        case 'min_compac':
          validators.push(Validators.min(0), Validators.max(1800000), Validators.pattern(/^\d+$/))
          break;
        case 'maxMessage':
          validators.push(Validators.min(1), Validators.max(100000000), Validators.pattern(/^\d+$/))
          break;
        case 'segm_index':
          validators.push(Validators.min(4), Validators.max(2147483647), Validators.pattern(/^\d+$/))
          break;
        case "retention_ms":
          validators.push(Validators.min(-1), Validators.max(9007199254740991), Validators.pattern(/^-?\d+$/))
          break;
        case 'segment_ms':
          validators.push(Validators.min(1), Validators.max(6048000000), Validators.pattern(/^\d+$/))
          break;
        case 'deleteRet':
          validators.push(Validators.min(0), Validators.max(864000000), Validators.pattern(/^\d+$/))
          break;
        case 'segment':
          validators.push(Validators.min(14), Validators.max(2147483647), Validators.pattern(/^\d+$/))
          break;
        case 'flush_mess':
        case 'max_comp':
          validators.push(Validators.min(1), Validators.max(9007199254740991), Validators.pattern(/^\d+$/))
          break;
        case 'mess_time_diff':
        case 'flush_ms':
        case 'segm_jitt':
          validators.push(Validators.min(0), Validators.max(9007199254740991), Validators.pattern(/^\d+$/))
          break;
      }
      this.validateForm.get(name).setValue(value);
      this.validateForm.get(name).setValidators(validators);
      this.validateForm.get(name).updateValueAndValidity();
    })
  }

  removeValidatefig() {

    this.listConfigLabel.forEach(element => {
      const { name } = element;
      this.validateForm.get(name).clearAsyncValidators();
      this.validateForm.get(name).updateValueAndValidity();
    })
  }

  cancelForm() {
    this.cancelEvent.emit();
  }

  submitForm() {
    console.log();
  }

  onKeyDown(event: KeyboardEvent): void {
    const keyCode = event.key;
    const isNumberOrBackspace = /[0-9]|Backspace/.test(keyCode);
    const isArrowKeyOrTab = /^Arrow(Up|Down|Left|Right)$/.test(keyCode) || keyCode === 'Tab';
    if (!isNumberOrBackspace && !isArrowKeyOrTab) {
      event.preventDefault();
    }
  }

  onKeyDownIgnore(event: KeyboardEvent): void {
    const keyCode = event.key;
    const isNumberOrBackspace = /[-0-9]|Backspace/.test(keyCode);
    const isArrowKeyOrTab = /^Arrow(Up|Down|Left|Right)$/.test(keyCode) || keyCode === 'Tab';
    if (!isNumberOrBackspace && !isArrowKeyOrTab) {
      event.preventDefault();
    }
  }

  onKeyDownDot(event: KeyboardEvent) {
    const keyCode = event.key;
    const isNumberOrBackspace = /[.0-9]|Backspace/.test(keyCode);
    const isArrowKeyOrTab = /^Arrow(Up|Down|Left|Right)$/.test(keyCode) || keyCode === 'Tab';
    if (!isNumberOrBackspace && !isArrowKeyOrTab) {
      event.preventDefault();
    }
  }

  changePartition() {
    const parControl = this.validateForm.get('partition');
    if (parControl.hasError('required')) {
      this.errMessPartition = "Partition không được để trống";
    } else if (parControl.hasError('max') || parControl.hasError('min') || parControl.hasError('pattern')) {
      this.errMessPartition = "Partition chỉ nằm trong khoảng 1 đến 100";
    }
  }

  changeReplica() {
    const replica = this.validateForm.controls['replicaFactor'];
    const minInsync = this.validateForm.controls['minInsync'];
    if (replica.value != null && replica.value != '') {
      if (!this.isSettingAdvanced) {
        this.listConfigLabel.forEach(e => e.name == 'minInsync' ? e.value = replica.value : e.value);
        minInsync.setValue(replica.value);
      }
      if (minInsync.value != null) {
        if (minInsync.value > replica.value) {
          replica.setErrors({'invalidvalue': true})
        } else {
          minInsync.setErrors(null);
        }
      }
    }
  }

  changeMinInsync() {
    const replica = this.validateForm.controls['replicaFactor'];
    const minInsync = this.validateForm.controls['minInsync'];
    if (replica.value != null && minInsync.value != null) {
      if (minInsync.value > replica.value) {
        minInsync.setErrors({'invalidvalue': true})
      } else {
        replica.setErrors(null);
      }
    }
  }

  changeMaxMessage() {
    const maxMessage = this.validateForm.controls['maxMessage'];
    const segment = this.validateForm.controls['segment'];
    if (maxMessage.value != null && segment != null) {
      if (Number.parseInt(maxMessage.value) >= Number.parseInt(segment.value)) {
        maxMessage.setErrors({'invalidvalue': true});
      } else {
        maxMessage.setErrors(null);
      }
    }
  }

  changeSegment() {
    const maxMessage = this.validateForm.controls['maxMessage'];
    const segment = this.validateForm.controls['segment'];
    if (maxMessage.value != null && segment != null) {
      if (Number.parseInt(maxMessage.value) >= Number.parseInt(segment.value)) {
        segment.setErrors({'invalidvalue': true});
      } else {
        maxMessage.setErrors(null);
      }
    }
  }

  createTopic() {

    this.changePartition();
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (!this.validateForm.invalid) {
      this.loadingSrv.open({ type: "spin", text: "Loading..." });
      const json = {};
      const topicName = this.validateForm.get("name_tp").value;
      const partitionNum = Number(this.validateForm.get("partition").value);
      const replicationFactorNum = Number(this.validateForm.get("replicaFactor").value);
      if (!this.isSettingAdvanced) {
        this.topicKafkaService.createTopic(topicName, partitionNum, replicationFactorNum, this.serviceOrderCode, 0, JSON.stringify(json))
          .subscribe(
            (data: any) => {
              this.loadingSrv.close();
              if (data && data.code == 200) {
                this.notification.success(this.i18n.fanyi('app.status.success'), data.msg);
                this.cancelForm();
              } else {
                this.notification.error(this.i18n.fanyi('app.status.fail'), data.msg);
              }
            }
          );
      }
      else {
        this.listConfigLabel
          .filter(element => element.name !== "typeTime" && element.name !== "re_hours")
          .forEach(element => {
            const { name, value, type, fullname } = element;
            if (this.validateForm.get(name).value != "" || this.validateForm.get(name).value != null)
              switch (name) {
                case 'lead_rep':
                case 'foll_repl':
                  json[fullname] = (this.validateForm.get(name).value == "none") ? "" : "*"
                  break;
                default:
                  if (type == 'number') {
                    json[fullname] = Number(this.validateForm.get(name).value);
                  }
                  else
                    json[fullname] = this.validateForm.get(name).value;
                  break;
              }
            else {
              json[fullname] = value;
            }
          })

        this.topicKafkaService.createTopic(topicName, partitionNum, replicationFactorNum, this.serviceOrderCode, 1, JSON.stringify(json))
          .subscribe(
            (data: any) => {
              if (data && data.code == 200) {
                this.loadingSrv.close();
                this.notification.success(this.i18n.fanyi('app.status.success'), data.msg);
                this.cancelForm();
              } else {
                this.notification.error(this.i18n.fanyi('app.status.fail'), data.msg);
              }
            }
          );
      }
    }
  }

  updateTopic() {
    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.changePartition()
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (!this.validateForm.invalid) {
      let i = 0;
      const json = {};
      const topicName = this.validateForm.get("name_tp").value;
      this.listConfigLabel
        .filter(element => element.name !== "typeTime" && element.name !== "re_hours")
        .forEach(element => {
          const { name, value, fullname } = element;
          if (this.validateForm.get(name).value === "" || this.validateForm.get(name).value === null){
            switch (name) {
              case 'lead_rep':
              case 'foll_repl':
                json[fullname] = (value == "none") ? "" : "*"
                break;
              default:
                json[fullname] = value;
                break;
              }
          }
          else {
            switch (name) {
              case 'lead_rep':
              case 'foll_repl':
                json[fullname] = (this.validateForm.get(name).value == "none") ? "" : "*"
                break;
              default:
                json[fullname] = this.validateForm.get(name).value;
                break;
            }
          }

          i++;
        })
      this.topicKafkaService.updateTopic(topicName, this.serviceOrderCode, json)
        .subscribe(
          (data: any) => {
            if (data && data.code == 200) {
              this.notification.success(this.i18n.fanyi('app.status.success'), data.msg);
              this.cancelForm();
            } else {
              this.notification.error(this.i18n.fanyi('app.status.fail'), data.msg);
            }
            this.loadingSrv.close();
          }
        );
    }
  }
}
