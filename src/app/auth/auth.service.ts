import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {IAuth} from "./auth.interface";
import {Md5} from 'ts-md5';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private authData$: BehaviorSubject<IAuth> = new BehaviorSubject<IAuth>({
    username: '',
    password: ''
  });
  private authObj$: IAuth = {
    username: 'vnpt',
    password: Md5.hashStr('Vnpt@2024')
  }

  constructor() {
  }

  public get getAuthObj$(): IAuth {
    return this.authObj$;
  }

  public getAuth$() {
    return this.auth$;
  }

  public setAuth(auth: boolean) {
    this.auth$.next(auth);
  }

  public getAuthData$() {
    return this.authData$;
  }

  public setAuthData(authData: IAuth) {
    this.authData$.next(authData);
  }

  public checkAuthData(authData: IAuth): boolean {
    const {password} = authData;
    const passwordHashed = Md5.hashStr(password);
    return this.authObj$.username === authData.username && this.authObj$.password === passwordHashed;
  }
}
