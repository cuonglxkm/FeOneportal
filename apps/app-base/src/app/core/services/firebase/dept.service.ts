import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, Query } from '@angular/fire/compat/firestore';
import { PageInfo, SearchCommonVO } from '@app/core/models/interfaces/types';
import { Observable, from, map } from 'rxjs';
import firebase from 'firebase/compat/app';
import { Dept } from '@core/models/interfaces/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private lastVisible: any;
  private deptCollection: AngularFirestoreCollection<Dept>;
  private deptList: Observable<Dept[]>;

  constructor(private firestore: AngularFirestore) {
    this.deptCollection = this.firestore.collection<Dept>('depts');
    this.deptList = this.deptCollection.snapshotChanges().pipe(
      map((actions: DocumentChangeAction<Dept>[]) =>
        actions.map((action: DocumentChangeAction<any>) => {
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;
          return { ...data, id, createTime: data.createTime.toMillis() };
        })
      )
    );
  }

  getdeptList0(): Observable<Dept[]> {
    return this.deptList;
  }

  private getQueryPage(query: Query<Dept>): Observable<any[]> {
    debugger
    return new Observable((observer) => {
      query.get().then((snapshots: any) => {
        const data: any = [];
        snapshots.forEach((snapshot: any) => {
          data.push({
            id: snapshot.id,
            ...snapshot.data(),
          });
        });
        this.lastVisible = snapshots.docs[snapshots.docs.length - 1];
        observer.next(data);
      });
    });
  }

  getdeptList(params: SearchCommonVO<any>): Observable<PageInfo<Dept>> {
    debugger
    const { pageNum, pageSize } = params
    const offset = (pageNum - 1) * pageSize;

    const query = this.lastVisible
      ? this.deptCollection.ref.orderBy('name').startAfter(this.lastVisible).limit(pageSize)
      : this.deptCollection.ref.orderBy('name').limit(pageSize);

    return this.getQueryPage(query).pipe(
      map((data) => {
        const total = data.length > 0 ? data[0].total : 0;

        return {
          list: data.map((change) => change.payload.doc.data()),
          total,
          pageSize,
          pageNum,
        };
      })
    );
  }

  addDepts(data: any): Observable<void> {
    data.createTime = firebase.firestore.FieldValue.serverTimestamp();
    data.updateTime = firebase.firestore.FieldValue.serverTimestamp();

    return new Observable((observer) => {
      this.deptCollection.add(data)
        .then((res) => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  editDepts(params: any): Observable<void> {
    params.updateTime = firebase.firestore.FieldValue.serverTimestamp();
    let ids: string
    const { id, ...data } = params
    ids = params.id || ""
    return from(this.deptCollection.doc<Dept>(ids).update(data))
  }

  delDepts(id: string): Observable<void> {
    return from(this.deptCollection.doc(id).delete())
  }

  getDeptDetail(id: string): Observable<any> {
    return from(this.deptCollection.doc<Dept>(id)
      .snapshotChanges()
      .pipe(
        map(snapshot => {
          const data = snapshot.payload.data();
          const id = snapshot.payload.id;
          return { ...data, id };
        })
      ))
  }
}
