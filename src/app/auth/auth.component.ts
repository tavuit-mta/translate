import {Component, OnDestroy, OnInit} from '@angular/core';
import {IAuth} from "./auth.interface";
import {AuthService} from './auth.service';
import {skip, Subject, takeUntil} from 'rxjs';
import {ToastService} from "../toast/toast.service";

@Component({
  selector: 'translate-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  providers: [ToastService]
})
export class AuthComponent implements OnInit, OnDestroy {
  private onDestroy$: Subject<void> = new Subject<void>();
  private _authData: IAuth = {
    username: 'vnpt',
    password: ''
  };

  constructor(
    public authService: AuthService,
    private _toast: ToastService
  ) {
  }

  ngOnInit() {
    this.authService.getAuth$().pipe(
      takeUntil(this.onDestroy$),
      skip(1)
    ).subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          this._toast.openToast('Login success');
          return;
        }
        this._toast.openToast('Login failed');
      }
    )
  }

  public get authData(): IAuth {
    return this._authData;
  }

  public onLogin(): void {
    if (!this._authData.username || !this._authData.password) {
      return;
    }
    this.authService.setAuthData(this._authData);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
