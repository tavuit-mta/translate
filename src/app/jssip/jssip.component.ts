import {Component, OnDestroy, OnInit} from '@angular/core';
import {JssipService} from './jssip.service';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'translate-jssip',
  templateUrl: './jssip.component.html',
  styleUrls: ['./jssip.component.scss']
})
export class JssipComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  public isConnected: boolean = false;

  constructor(
    public jssipService: JssipService
  ) {
  }

  ngOnInit() {
    this.jssipService.isConnected.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((isConnected: boolean) => {
      this.isConnected = isConnected;
    })
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
