import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AuthComponent} from "./auth/auth.component";
import {AuthService} from './auth/auth.service';
import {filter, skip, Subject, takeUntil} from 'rxjs';
import {EAuthStorage} from "./auth/auth.enums";
import {ToastService} from './toast/toast.service';
import {JssipService} from './jssip/jssip.service';
import * as JsSIP from 'jssip';
import {RecordsService} from "./records/records.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  private onDestroy$ = new Subject<void>();
  private _isLoggedIn: boolean = false;

  constructor(
    public dialog: MatDialog,
    public authService: AuthService,
    private jssipService: JssipService,
    private _toast: ToastService,
    private recordsService: RecordsService,
  ) {
    JsSIP.debug.enable('JsSIP:*'); // more detailed debug output
  }

  ngOnInit() {
    this.authService.getAuth$().pipe(
      takeUntil(this.onDestroy$),
      skip(1),
    ).subscribe((isLoggedIn) => {
        this._isLoggedIn = isLoggedIn
        if (isLoggedIn) {
          this.jssipService.connectServer();
          return;
        }
        this.jssipService.disconnectServer();
        return;
      }
    )


    this.authService.getAuthData$().pipe(
      takeUntil(this.onDestroy$),
      filter((data) => !!data.username && !!data.password)
    ).subscribe((dataAuth) => {
      const isLoggedIn = this.authService.checkAuthData(dataAuth);
      this.authService.setAuth(isLoggedIn);
      if (!isLoggedIn) {
        return;
      }
      localStorage.setItem(EAuthStorage.AuthKey, JSON.stringify(dataAuth));
    })
  }

  ngAfterViewInit() {
    const _authenStorage = localStorage.getItem(EAuthStorage.AuthKey);
    if (_authenStorage) {
      this.authService.setAuthData(JSON.parse(_authenStorage));
      return;
    }
  }

  public get isLoggedIn(): boolean {
    return this._isLoggedIn;
  }

  public onOpenAuthDialog(): void {
    if (this.isLoggedIn) {
      this.onLogout();
      return;
    }
    this.dialog.open(AuthComponent, {
      width: '400px'
    })
  }

  public onLogout(): void {
    this.authService.setAuth(false);
    this.recordsService.onStopRecord();
    localStorage.removeItem(EAuthStorage.AuthKey);
    this._toast.openToast('Logout success');
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
