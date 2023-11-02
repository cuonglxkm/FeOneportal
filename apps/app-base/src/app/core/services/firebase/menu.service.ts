import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, Query } from '@angular/fire/compat/firestore';
import { MenuAdmin, PageInfo, SearchCommonVO } from '@app/core/models/interfaces/types';
import { Observable, from, map } from 'rxjs';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private lastVisible: any;
  private menuCollection: AngularFirestoreCollection<MenuAdmin>;
  private menuList: Observable<MenuAdmin[]>;

  constructor(private firestore: AngularFirestore) {
    this.menuCollection = this.firestore.collection<MenuAdmin>('menu');
    this.menuList = this.menuCollection.snapshotChanges().pipe(
      map((actions: DocumentChangeAction<MenuAdmin>[]) =>
        actions.map((action: DocumentChangeAction<any>) => {
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;
          return { ...data, id, createTime: data.createTime.toMillis() };
        })
      )
    );
  }

  getMenuList0(): Observable<MenuAdmin[]> {
    return this.menuList;
  }

  private getQueryPage(query: Query<MenuAdmin>): Observable<any[]> {
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

  getMenuList(params: SearchCommonVO<any>): Observable<PageInfo<MenuAdmin>> {
    debugger
    const { pageNum, pageSize } = params
    const offset = (pageNum - 1) * pageSize;

    const query = this.lastVisible
      ? this.menuCollection.ref.orderBy('name').startAfter(this.lastVisible).limit(pageSize)
      : this.menuCollection.ref.orderBy('name').limit(pageSize);

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

  addMenus(data: any): Observable<void> {
    data.createTime = firebase.firestore.FieldValue.serverTimestamp();
    data.updateTime = firebase.firestore.FieldValue.serverTimestamp();

    return new Observable((observer) => {
      this.menuCollection.add(data)
        .then((res) => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  editMenus(params: any): Observable<void> {
    params.updateTime = firebase.firestore.FieldValue.serverTimestamp();
    let ids: string
    const { id, ...data } = params
    ids = params.id || ""
    return from(this.menuCollection.doc<MenuAdmin>(ids).update(data))
  }

  delMenus(id: string): Observable<void> {
    return from(this.menuCollection.doc(id).delete())
  }

  getMenuDetail(id: string): Observable<any> {
    return from(this.menuCollection.doc<MenuAdmin>(id)
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
