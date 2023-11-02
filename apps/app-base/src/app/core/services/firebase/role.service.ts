import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, Query, QuerySnapshot } from '@angular/fire/compat/firestore';
import { fsRole } from '@core/models/interfaces/role';
import { Observable, from, map } from 'rxjs';
import firebase from 'firebase/compat/app';
import { PageInfo, SearchCommonVO } from '@core/models/interfaces/types';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private lastVisible: any;
  private roleCollection: AngularFirestoreCollection<fsRole>;
  private roleList: Observable<fsRole[]>;

  constructor(private firestore: AngularFirestore) {
    this.roleCollection = this.firestore.collection<fsRole>('roles');
    this.roleList = this.roleCollection.snapshotChanges().pipe(
      map((actions: DocumentChangeAction<fsRole>[]) =>
        actions.map((action: DocumentChangeAction<any>) => {
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;
          return { ...data, id, createTime: data.createTime.toMillis() };
        })
      )
    );
  }

  loadRoles(): void {
    this.roleList = this.roleCollection.valueChanges()
  }

  getroleList0(): Observable<fsRole[]> {
    return this.roleList;
  }

  private getQueryPage(query: Query<fsRole>): Observable<any[]> {
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

  getRoleList(params: SearchCommonVO<any>): Observable<PageInfo<fsRole>> {
    const { pageNum, pageSize, filters } = params
    const offset = (pageNum - 1) * pageSize;

    let query = filters.roleName
      ? this.firestore.collection('roles', ref => { return ref.where('roleName', '==', filters.roleName).limit(pageSize); })
      : this.firestore.collection('roles', ref => { return ref.orderBy('roleName').limit(pageSize) })
    // let query
    // if (!filters.roleName) {
    //   query = !this.lastVisible
    //     ? this.firestore.collection('roles', ref => { return ref.orderBy('roleName').limit(pageSize) })
    //     : this.firestore.collection('roles', ref => { return ref.orderBy('roleName').startAfter(this.lastVisible).limit(pageSize) })
    // } else {
    //   query = !this.lastVisible
    //     ? this.firestore.collection('roles', ref => { return ref.orderBy('roleName').where('roleName', '==', filters.roleName).limit(pageSize) })
    //     : this.firestore.collection('roles', ref => { return ref.orderBy('roleName').where('roleName', '==', filters.roleName).startAfter(this.lastVisible).limit(pageSize) })
    // }

    return new Observable((observer) => {
      query.get().subscribe((snapshots: any) => {
        const data: any = [];
        snapshots.forEach((snapshot: any) => {
          data.push({
            ...snapshot.data(),
            id: snapshot.id,
          });
        });
        return this.firestore.collection('roles', ref => { return filters.roleName ? ref.where('roleName', '==', filters.roleName) : ref }).get().subscribe((snapshot: any) => {
          this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
          observer.next({
            total: snapshot.size,
            list: data,
            pageSize,
            pageNum
          })
        })
      })

    })
  }

  addRoles(data: any): Observable<void> {
    data.createTime = firebase.firestore.FieldValue.serverTimestamp();
    data.updateTime = firebase.firestore.FieldValue.serverTimestamp();

    return new Observable((observer) => {
      this.roleCollection.add(data)
        .then((res) => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  editRoles(params: any): Observable<void> {
    params.updateTime = firebase.firestore.FieldValue.serverTimestamp();
    let ids: string
    const { id, ...data } = params
    ids = params.id || ""
    return from(this.roleCollection.doc<fsRole>(ids).update(data))
  }

  delRoles(id: string): Observable<void> {
    return from(this.roleCollection.doc(id).delete())
  }

  getRoleDetail(id: string): Observable<any> {
    return from(this.roleCollection.doc<fsRole>(id)
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
