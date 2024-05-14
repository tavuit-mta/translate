import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import * as JsSIP from 'jssip';
import {CJssipOption, EJssip} from "./jssip.enums";
import {RTCSession} from 'jssip/lib/RTCSession';
import {RTCSessionEvent, RTCSessionListener} from "jssip/lib/UA";

@Injectable({
  providedIn: 'root'
})
export class JssipService {
  public _sipStatus: BehaviorSubject<string> = new BehaviorSubject<string>('');


  private sipUA: JsSIP.UA | null = null;
  private _isConnected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _sipSession: RTCSession | null = null;
  private _sipPhone: number = 3000;
  private _cipCallOptions = CJssipOption

  constructor() {
  }

  public connectServer(): void {
    this.sipUA = new JsSIP.UA({
      sockets: [new JsSIP.WebSocketInterface(EJssip.ConnectString)],
      uri: EJssip.Uri.toString(),
      password: EJssip.Password.toString()
    })
    this.registerEvents();
    this.registerSessionEvents();
    this.sipUA.start();
    this.sipUA.call(this._sipPhone.toString(), this._cipCallOptions);
  }

  private registerEvents(): void {
    if (!this.sipUA) {
      return;
    }
    this.sipUA.on('connecting', e => {
      this._sipStatus.next('Connecting...');
    });

    this.sipUA.on('connected', e => {
      this._sipStatus.next('Connected');
    });

    this.sipUA.on('newRTCSession', (event: RTCSessionEvent) => {
      const session = event.session;
      if (this._sipSession) {
        this._sipSession.terminate();
      }
      this._sipSession = session;
    })


    //SESSION EVENTS
  }

  private registerSessionEvents(): void {
    if (!this._sipSession) {
      return;
    }
    this._sipSession.on('confirmed', (e: any) => {

    })
  }

  public disconnectServer(): void {
    if (!this.sipUA) {
      return;
    }
    this.sipUA.stop();
    this.sipUA = null;
    this.setConnectState(false);
  }

  public get isConnected(): BehaviorSubject<boolean> {
    return this._isConnected;
  }

  public setConnectState(state: boolean): void {
    this._isConnected.next(state);
  }
}
