import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { fsUser } from '@core/models/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private dbPath = '/users'
  userCollection: AngularFirestoreCollection<fsUser>

  constructor(private db: AngularFirestore) {
    this.userCollection = db.collection(this.dbPath)
  }

  getAll(): AngularFirestoreCollection<fsUser> {
    return this.userCollection
  }

  create(data: fsUser): any {
    return this.userCollection.add({ ...data })
  }

  update(id: string, data: any): Promise<void> {
    return this.userCollection.doc(id).update(data)
  }

  delete(id: string): Promise<void> {
    return this.userCollection.doc(id).delete()
  }
}
