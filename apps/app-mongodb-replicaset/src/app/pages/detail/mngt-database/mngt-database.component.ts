import { Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DatabaseService } from '../../../service/database.service';
import { Collection, CollectionInfo } from '../../../model/database.model';
// import { AppDetail } from '../model/appdetail.model';
import { format } from 'date-fns';
import { is } from 'date-fns/locale';
import { LoadingService } from '@delon/abc/loading';
import {
  NzNotificationModule,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { ShareService } from '../../../service/share.service';
import { Subject, takeUntil } from 'rxjs';
import { UtilService } from '../../../service/utils.service';
import { NotiStatusEnum } from '../../../enum/noti-status.enum';

@Component({
  selector: 'one-portal-mngt-database',
  templateUrl: './mngt-database.component.html',
  styleUrls: ['./mngt-database.component.css'],
})
export class MngtDatabaseComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();

  // @Input() service: AppDetail | any;
  @Input() serviceCode: string;
  // listOfCollection : Collection[];
  // sampleData : Database[] | any;
  currentDatabase: string;
  currentCollection: string;
  inputValue: string;
  isShowCreateDB: boolean;
  isShowCreateColl: boolean;
  isDelColl: boolean;
  isShowDelDB: boolean | undefined;
  selectedOptionDatabase = '';
  selectedOptionColl = '';
  listOfDatabase: any[];
  listOfCollection: CollectionInfo[];

  listOfDatabaseSearch: string[] | any;

  validateFormAddDb: FormGroup | any;

  validateFormAddColl: FormGroup | any;

  openMap: { [name: string]: boolean } = {};
  // validateFormDelDB : FormGroup | any;

  storageSize: string;
  totalDocument: string;
  indexSize: string;
  size: string;
  currentPage = 0;

  isValidButtonDelDB: boolean;
  isValidButtonDelColl: boolean;
  inputDelDB: string;
  inputDelColl: string;

  isLoading: boolean;

  isSuccess: boolean;
  isFail: boolean;

  isSuccess1: boolean;
  isFail1: boolean;

  isSuccess2: boolean;
  isFail2: boolean;

  isSuccess3: boolean;
  isFail3: boolean;

  listOfTitleCollection: string[] = [];

  isErrorCheckDelete = false;
  dbDelete = "";
  msgError = "";
  isInitModal = false;

  typeData = "b";
  pageSize : number;
  pageIndex : number;
  total: number;

  totalDatabase : number;
  totalCollection : number;

  // validateFormAddDatabase : FormGroup;
  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private loadingSrv: LoadingService,
    private notification: NzNotificationService,
    private shareService: ShareService,
    private utilService: UtilService
  ) {
    this.listOfDatabase = [];
    this.isShowCreateDB = false;
    this.isShowCreateColl = false;
    this.isDelColl = false;
    this.listOfCollection = [];
    this.listOfDatabaseSearch = [];
    this.inputValue = '';
    this.currentDatabase = '';
    this.currentCollection = '';
    this.storageSize = '';
    this.totalDocument = '';
    this.indexSize = '';
    this.size = '';
    this.isValidButtonDelDB = true;
    this.inputDelDB = '';
    this.isValidButtonDelColl = true;
    this.inputDelColl = '';

    this.isLoading = false;

    this.totalDatabase = 0;
    this.totalCollection = 0;
  }

  ngOnInit() {

    // listen event refresh page
    this.shareService.dbColObs
    .pipe(takeUntil(this.destroy$))
    .subscribe(r => {
      
      // TODO : call refresh page

    })

    this.countDBAndColl();

    // this.arrayTemp = this.sampleData;
    this.total = 1;
    this.pageIndex = 1;
    this.pageSize = 10;

    this.initDatabase();
    this.initFormAddDb();
    this.initFormAddColl();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  countDBAndColl() {
    this.dbService.countDbAndColl(this.serviceCode).subscribe(
      (r: any) => {
        this.totalDatabase = r.data[0];
        this.totalCollection = r.data[1];
        // console.log("data : ", r.data[0]);
      }
    )
  }

  // cap nhat validator database
  onChangeSelectDB() {
    if (this.selectedOptionDatabase == 'capped') {
      this.typeData = "b"
      this.validateFormAddDb
        .get('sizeDb')
        .setValidators([
          Validators.required,
          Validators.pattern(/^[1-9][0-9]*$/),
          Validators.max(2147483648),
          Validators.min(1)
        ]);
      this.validateFormAddDb.get('timestampDb').clearValidators();
      this.validateFormAddDb.get('metaDb').clearValidators();
      this.validateFormAddDb.get('granularityDb').clearValidators();
    } else if (this.selectedOptionDatabase == 'time') {
      this.validateFormAddDb.get('sizeDb').clearValidators();
      this.validateFormAddDb
        .get('timestampDb')
        .setValidators([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_-]{1,100}$/),
        ]);
      this.validateFormAddDb
        .get('metaDb')
        .setValidators([
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9_-]{1,100}$/), 
        ]);
      this.validateFormAddDb
        .get('granularityDb')
        .setValidators(Validators.required);
    } else {
      this.validateFormAddDb.get('sizeDb').clearValidators();
      this.validateFormAddDb.get('timestampDb').clearValidators();
      this.validateFormAddDb.get('metaDb').clearValidators();
      this.validateFormAddDb.get('granularityDb').clearValidators();
    }

    this.validateFormAddDb.get('sizeDb').updateValueAndValidity();
    this.validateFormAddDb.get('timestampDb').updateValueAndValidity();
    this.validateFormAddDb.get('metaDb').updateValueAndValidity();
    this.validateFormAddDb.get('granularityDb').updateValueAndValidity();
  }

  duplicateValidator: ValidatorFn = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return ;
    } else if (this.validateFormAddDb.controls.metaDb.value === this.validateFormAddDb.controls.timestampDb.value) {
      return { duplicate: true, error: true };
    }
    return {};
  };

  checkDuplicateTS(){
    const metaDb = this.validateFormAddDb.controls['metaDb'];
    const timestampDb = this.validateFormAddDb.controls['timestampDb'];
    if( !metaDb.value || !timestampDb.value)
      return
    if( metaDb.value === timestampDb.value){
      timestampDb.setErrors({'duplicate': true})
    } else {
      metaDb.setErrors(null);
    }
  }

  checkDuplicateMD(){
    const metaDb = this.validateFormAddDb.controls['metaDb'];
    const timestampDb = this.validateFormAddDb.controls['timestampDb'];
    if( !metaDb.value || !timestampDb.value)
      return
    if( metaDb.value === timestampDb.value){
      metaDb.setErrors({'duplicate': true})
    } else {
      timestampDb.setErrors(null);
    }
  }
  
  checkDuplicateTSColl(){
    const metaColl = this.validateFormAddColl.controls['metaColl'];
    const timestampColl = this.validateFormAddColl.controls['timestampColl'];
    if( !metaColl.value || !timestampColl.value)
      return
    if( metaColl.value === timestampColl.value){
      timestampColl.setErrors({'duplicate': true})
    } else {
      metaColl.setErrors(null);
    }
  }

  checkDuplicateMDColl(){
    const metaColl = this.validateFormAddColl.controls['metaColl'];
    const timestampColl = this.validateFormAddColl.controls['timestampColl'];
    if( !metaColl.value || !timestampColl.value)
      return
    if( metaColl.value === timestampColl.value){
      metaColl.setErrors({'duplicate': true})
    } else {
      timestampColl.setErrors(null);
    }
  }
  // cap nhat validator collection
  onChangeSelectColl() {
    console.log('onchange select colll  ');
    this.validateFormAddColl
        .get('sizeColl')
    if (this.selectedOptionColl == 'capped') {
      this.typeData = "b"
      this.validateFormAddColl
        .get('sizeColl').setValue(null);
      this.validateFormAddColl
        .get('sizeColl')
        .setValidators([
          Validators.required,
          Validators.pattern(/^[1-9][0-9]*$/),
          Validators.max(2147483648),
          Validators.min(1)
        ]);
      this.validateFormAddColl.get('timestampColl').clearValidators();
      this.validateFormAddColl.get('metaColl').clearValidators();
      this.validateFormAddColl.get('granularityColl').clearValidators();
    } else if (this.selectedOptionColl == 'time') {
      this.validateFormAddColl.get('sizeColl').clearValidators();
      this.validateFormAddColl
        .get('timestampColl')
        .setValidators([
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9_-]{1,100}$/)
        ]);
      this.validateFormAddColl
        .get('metaColl')
        .setValidators([
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9_-]{1,100}$/)
        ]);
      this.validateFormAddColl
        .get('granularityColl')
        .setValidators(Validators.required);
    } else {
      this.validateFormAddColl.get('sizeColl').clearValidators();
      this.validateFormAddColl.get('timestampColl').clearValidators();
      this.validateFormAddColl.get('metaColl').clearValidators();
      this.validateFormAddColl.get('granularityColl').clearValidators();
    }

    this.validateFormAddColl.get('sizeColl').updateValueAndValidity();
    this.validateFormAddColl.get('timestampColl').updateValueAndValidity();
    this.validateFormAddColl.get('metaColl').updateValueAndValidity();
    this.validateFormAddColl.get('granularityColl').updateValueAndValidity();
  }

  initDatabase() {
    // this.dbService.getAllDatabase(this.service.service_order_code).subscribe(
    this.dbService.getAllDatabase(this.serviceCode).subscribe(
      (result:any) => {
        if (result && result.data.length > 0) {
        this.listOfDatabase = result.data.map((item: any) => ({
            ...item,
            isSelected: false,
          }));
          this.listOfDatabase[0].isSelected = true;

          this.listOfDatabaseSearch = this.listOfDatabase;

          this.changeInput(this.listOfDatabase[0].db);
        } else {
          this.listOfDatabaseSearch = [];
          this.listOfDatabase = [];
          this.listOfCollection = [];
          this.listOfDatabase[0].isSelected = false;
        }

      }
    );
  }

  initDatabaseWithIndex(db: string) {
    this.dbService.getAllDatabase(this.serviceCode).subscribe(
      (result: any) => {
        if (result && result.data.length > 0) {
          this.listOfDatabase = result.data.map((item: any) => ({
            ...item,
            isSelected: false,
          }));

          for (const item of this.listOfDatabase) {
            if (item.db == db) {
              item.isSelected = true;
              this.changeInput(item.db);
              break;
            }
          }
        }
      },
      (error: any) => {
        console.error('Error fetching data: ', error);
      }
    );
  }

  initFormAddDb() {
    this.validateFormAddDb = this.fb.group({
      dbName: [
        '',
        [
          Validators.required,
          Validators.maxLength(64),
          Validators.pattern(/^[a-zA-Z0-9_]{1,64}$/),
        ],
      ],
      collectionDb: [
        '',
        [
          Validators.required,
          Validators.maxLength(128),
          Validators.pattern(/^[a-zA-Z0-9_]{1,128}$/),
        ],
      ],
      sizeDb: [],
      timestampDb: [],
      metaDb: [],
      granularityDb: [],
    });
  }

  initFormAddColl() {
    console.log("currentDatabase: ",this.currentDatabase);
    
    this.validateFormAddColl = this.fb.group({
      collectionName: [
        '',
        [
          Validators.required,
          Validators.maxLength(128),
          Validators.pattern(/^[a-zA-Z0-9_]{1,128}$/),
        ],
      ],
      sizeColl: [],
      timestampColl: [],
      metaColl: [],
      granularityColl: [],
      currentDB:[{ value: '', disabled: true }]
    });
  }

  

  dropCollection(currentDB: string, coll: string) {
    this.currentCollection = coll;
    this.isDelColl = true;
  }

  onChangeSearch(event: string) {
    if (event.trim() == '') {
      this.listOfDatabase = this.listOfDatabaseSearch;
    }
    this.listOfDatabase = this.listOfDatabase.filter((item: any) =>
      item.db?.includes(event)
    );
    // this.listOfCollection = this.listOfDatabase[0]
  }

  showCreateDB(): void {
    this.isShowCreateDB = true;
  }

  hideCreateDB() {
    this.selectedOptionDatabase = '';
    this.validateFormAddDb.reset();
    this.isShowCreateDB = false;
  }

  showCreateCollection() {
    this.validateFormAddColl.controls.currentDB.setValue(this.currentDatabase);
    this.isShowCreateColl = true;
  }

  hideCreateColl() {
    this.isShowCreateColl = false;
    this.validateFormAddColl.reset();
    this.selectedOptionColl = '';
  }

  cancleCreateColl() {
    this.selectedOptionColl = '';
    this.validateFormAddColl.reset();
    this.isShowCreateColl = false;
  }

  synDatabase() {
    this.isLoading = true;

    this.dbService
      .syncDatabase(this.serviceCode, this.currentDatabase)
      .pipe()
      .subscribe((r: any) => {
        if (r && r.code === 200) {
          this.isLoading = false;
          clearTimeout(timeoutId);
          console.log('sync database has successfully')
        }
      });
    this.initDatabaseWithIndex(this.currentDatabase);
    const timeoutId = setTimeout(() => {
      this.isLoading = false;
    }, 5000);

    this.countDBAndColl()
  }

  showDelDB() {
    this.isShowDelDB = true;
    this.isErrorCheckDelete = false;
    this.isInitModal = true;
    this.msgError = '';
    this.inputDelDB = '';
  }

  hideDelDB() {
    this.isShowDelDB = false;
    this.inputDelDB = '';
  }

  hideDelColl() {
    this.inputDelColl = '';
    this.isDelColl = false;
  }

  onChangeDelColl() {
    if (this.inputDelColl == this.currentCollection) {
      this.isValidButtonDelColl = false;
    } else {
      this.isValidButtonDelColl = true;
    }
  }

  delCollection() {
    // call api to drop collection
    this.isDelColl = false;
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });

    this.dbService
      .dropCollection(
        this.serviceCode,
        this.currentDatabase,
        this.currentCollection
      )
      .pipe()
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.isSuccess = true; // Assuming a boolean flag to control visibility

          // Reset form and close modal after a short delay
          setTimeout(() => {
            this.isSuccess = false;
            this.isShowCreateColl = false;
            this.validateFormAddColl.reset();
          }, 500);
          this.utilService.showNotification(NotiStatusEnum.SUCCESS, r.message)

          this.initDatabaseWithIndex(this.currentDatabase);
          this.countDBAndColl();
        } else {
          this.isFail = true; // Assuming a boolean flag to control visibility

          // Reset form and close modal after a short delay
          setTimeout(() => {
            this.isFail = false;
            this.isShowCreateColl = false;
            this.validateFormAddColl.reset();
          }, 500);
          this.utilService.showNotification(NotiStatusEnum.ERROR,"Thông báo",r.message)

          console.log('xoa collection khong thanh cong');
        }
        this.inputDelColl = '';
        this.loadingSrv.close();
      });
  }

  changeInput(db: any) {
    this.isLoading = true;
    // reset list title collection
    this.listOfTitleCollection = [];

    this.listOfDatabase.forEach((item) => {
      if (item.db == db) {
        item.isSelected = true;
      } else {
        item.isSelected = false;
      }
    });

    this.currentDatabase = db;
    this.validateFormAddColl.controls.currentDB.setValue(db);
    this.validateFormAddColl.controls.currentDB.updateValueAndValidity()
;
    this.storageSize = '';
    this.totalDocument = '';
    this.indexSize = '';
    this.size = '';
    let storageSizeNum = 0;
    let totalDocumentNum = 0;
    let indexSizeNum = 0;
    let sizenum = 0;
    this.dbService
      .getCollectionInfo(this.serviceCode, this.currentDatabase,this.pageSize, this.pageIndex)
      .subscribe(
        (result: any) => {

          console.log('result : ', result.data);

          if (result && result.code == 200) {
            this.listOfCollection = result.data.content;
            this.total = result.data.total;
            // this.pageIndex = ((result.data.offset)-1)/10 + 1;
            // this.pageSize = result.data.limit;

            this.listOfCollection.forEach((item) => {
              storageSizeNum += item.storage_size;
              totalDocumentNum += item.document_total;
              indexSizeNum += item.indexes;
              sizenum += item.size;
              this.listOfTitleCollection.push(item.coll);
            });
            this.storageSize = this.convertNumber(storageSizeNum);
            this.totalDocument = totalDocumentNum + '';
            this.indexSize = this.convertNumber(indexSizeNum);
            this.size = this.convertNumber(sizenum);
            this.isLoading = false;
            clearTimeout(timeoutId);
          }
        }
      );

    const timeoutId = setTimeout(() => {
      this.isLoading = false;
    }, 5000);
  }

  convertNumber(input: number): string {
    if (input <= 1024) {
      return input + 'B';
    } else if (input <= 1048576) {
      return (input / 1024).toFixed(1) + 'KB';
    } else if (input <= 1073741824) {
      return (input / 1048576).toFixed(1) + 'MB';
    }
    return (input / 1073741824).toFixed(1) + 'GB';
  }

  submitFormAddDb() {
    for (const i in this.validateFormAddDb.controls) {
      this.validateFormAddDb.controls[i].markAsDirty();
      this.validateFormAddDb.controls[i].updateValueAndValidity();
    }
    // this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    const commonCollection: Collection = {
      db: this.validateFormAddDb.value.dbName,
      collection: this.validateFormAddDb.value.collectionDb,
      max_size: 0,
      time_field: '',
      meta_field: '',
      granularity: '',
      type: '',
    };

    switch (this.selectedOptionDatabase) {
      case 'capped':
        commonCollection.type = 'capped';
        commonCollection.max_size = Number(this.validateFormAddDb.value.sizeDb);
        break;
      case 'time':
        commonCollection.meta_field = this.validateFormAddDb.value.metaDb;
        commonCollection.granularity = this.validateFormAddDb.value.granularityDb;
        commonCollection.time_field = this.validateFormAddDb.value.timestampDb;
        commonCollection.type = 'time-series';
        break;
    }

    this.dbService
      .createDatabase(this.serviceCode, commonCollection)
      .pipe()
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          // this.isSuccess1 = true; // Assuming a boolean flag to control visibility

          // Reset form and close modal after a short delay
          // setTimeout(() => {
          //   this.isSuccess1 = false;
          //   this.isShowCreateColl = false;
          //   this.validateFormAddColl.reset();
          // },500);
          this.isShowCreateDB = false;
          this.notification.success('Thông báo', r.message);
          this.initDatabaseWithIndex(this.validateFormAddDb.value.dbName);
          this.selectedOptionDatabase = ''
          this.validateFormAddDb.reset();
          this.countDBAndColl();
        } else {
          // this.isFail1 = true;
          this.notification.error('Thông báo', r.message);
          this.loadingSrv.close();
          this.selectedOptionDatabase = '';
          this.isShowCreateDB = false;
          this.validateFormAddDb.reset();
        } // Assuming a boolean flag to control visibility

        // Reset form and close modal after a short delay
        // setTimeout(() => {
        //   this.isFail1 = false;
        //   this.isShowCreateColl = false;
        //   this.validateFormAddColl.reset();
        // }, 500);
        // this.notification.error('Thông báo', r.message);
        // this.loadingSrv.close();
        // this.isShowCreateDB = false;
        // this.validateFormAddDb.reset();
      });
  }

  submitFormAddColl() {
    for (const i in this.validateFormAddColl.controls) {
      this.validateFormAddColl.controls[i].markAsDirty();
      this.validateFormAddColl.controls[i].updateValueAndValidity();
    }
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    const commonCollection: Collection = {
      db: this.currentDatabase,
      collection: this.validateFormAddColl.value.collectionName,
      max_size: 0,
      time_field: '',
      meta_field: '',
      granularity: '',
      type: '',
    };

    switch (this.selectedOptionColl) {
      case 'capped':
        commonCollection.type = 'capped';
        commonCollection.max_size = this.validateFormAddColl.value.sizeColl;
        break;
      case 'time':
        // eslint-disable-next-line no-case-declarations
        commonCollection.meta_field = this.validateFormAddColl.value.metaColl;
        (commonCollection.time_field =
          this.validateFormAddColl.value.timestampColl),
          (commonCollection.type = 'time-series');
        break;
      case '':
    }
    this.dbService
      .createCollection(this.serviceCode, commonCollection)
      .pipe()
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.isSuccess2 = true; // Assuming a boolean flag to control visibility

          // Reset form and close modal after a short delay
          // setTimeout(() => {
          //   this.isSuccess2 = false;
          //   this.isShowCreateColl = false;
          //   this.validateFormAddColl.reset();
          // },500);
          this.notification.success('Thông báo', r.message);
          this.initDatabaseWithIndex(this.currentDatabase);
          this.selectedOptionColl = ''
          this.isShowCreateColl = false;
          this.validateFormAddColl.reset();
          this.countDBAndColl();
        } else {
          this.isFail2 = true; // Assuming a boolean flag to control visibility

          // Reset form and close modal after a short delay
          this.notification.error('Thông báo', r.message);
        }
        this.loadingSrv.close();
        // this.selectedOptionColl = ''
        // this.initDatabaseWithIndex(this.currentDatabase);
        // this.isShowCreateColl = false;
        // this.validateFormAddColl.reset();
      });
  }

  onChangeDelDB() {
    this.isInitModal = false;
    if (this.inputDelDB.length == 0) {
      this.isErrorCheckDelete = true;
      this.msgError = 'Vui lòng nhập tên database';
    } else if (this.inputDelDB != this.currentDatabase) {
      this.isErrorCheckDelete = true;
      this.msgError = 'Tên database nhập chưa đúng';
    } else {
      this.isErrorCheckDelete = false;
      this.msgError = '';
    }
  }

  delDatabase() {
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.dbService
      .dropDatabase(this.serviceCode, this.inputDelDB)
      .pipe()
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.isSuccess3 = true; // Assuming a boolean flag to control visibility

          // Reset form and close modal after a short delay
          setTimeout(() => {
            this.isSuccess3 = false;
            this.isShowCreateColl = false;
            this.validateFormAddColl.reset();
          },500);
          this.notification.success('Thông báo', r.message);
          this.initDatabase();
          this.countDBAndColl();
        } else {
          this.isFail3 = true; // Assuming a boolean flag to control visibility

          // Reset form and close modal after a short delay
          setTimeout(() => {
            this.isFail3 = false;
            this.isShowCreateColl = false;
            this.validateFormAddColl.reset();
          },500);
          this.notification.error('Thông báo', r.message);
        }
        this.inputDelDB = '';
        this.loadingSrv.close();
        this.isShowDelDB = false;
      });
  }

  handlePageIndexChange(index : number){
    this.pageIndex = index;
    console.log('page index', index);
    this.changeInput(this.currentDatabase)
  }

  handlePageSizeChange(size : number){
    console.log('page size',size);
    this.pageSize = size;
    this.changeInput(this.currentDatabase)
  }

  protected readonly parseInt = parseInt;
  protected readonly Number = Number;
}
