import {Component, OnDestroy, OnInit} from '@angular/core';
import {RecordsService} from './records.service';
import {ERecordsState} from './records.enums';
import {Subject, filter, takeUntil, throttleTime} from 'rxjs';
import {IRecord} from './records.interface';
import {Queue} from "./record.queue";

@Component({
  selector: 'translate-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public state: ERecordsState = ERecordsState.Stop;
  public ERecordsState = ERecordsState;
  public records: IRecord[] = [];
  public displayedColumns: string[] = ['sourceText', 'targetText', 'audioPath', 'receivedAt', 'actions'];
  private _queue: Queue<HTMLAudioElement> = new Queue<HTMLAudioElement>();
  public index = 0;
  public isPlaying = false;

  constructor(
    private recordsService: RecordsService,
  ) {
  }

  get isRecording(): boolean {
    return ERecordsState.Start === this.state;
  }
  ngOnInit() {
    this.recordsService.recordState.pipe(
      takeUntil(this.destroy$)
    ).subscribe((state: ERecordsState) => {
      this.state = state;
    });

    this.recordsService.records.pipe(
      takeUntil(this.destroy$)
    ).subscribe((records: IRecord[]) => {
      this.records = records;
    });

    this.recordsService.record.pipe(
      takeUntil(this.destroy$),
      filter(Boolean),
      throttleTime(1000),
    ).subscribe((record: IRecord) => {
      this.recordsService.setRecords([record, ...this.records])
      const audio = new Audio(record.audioPath);
      this._queue.push(audio);
      this.playRecord(this.index)
    })
  }

  playRecord(index: number): void {
    if (!this._queue.getElements(index) || this.isPlaying) {
      return;
    }
    this.isPlaying = true
    const _this = this;
    this._queue.getElements(index).addEventListener('ended', function () { //this will bind a function to the "ended" event
      //increment the index to target the next element
      index++;
      _this.index = index;
      _this.isPlaying = false;
      if (index < _this._queue.getStore().length) {
        //plays the next song and binds the function to the ended event again until the queue is empty
        _this.playRecord(index);
      }
    })
    this._queue.getElements(index).play(); //this will play the element
  }

  onChangeState(): void {
    if (this.state === ERecordsState.Start) {
      this.onStopRecord();
      return;
    }
    this.onHandleRecord();
  }

  onHandleRecord(): void {
    console.log('Start recording');
    this.recordsService.onStartRecord();
  }

  onStopRecord(): void {
    console.log('Stop recording');
    this.recordsService.onStopRecord();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
