import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ERecordsState, EWS, constraints, ERecorsSteam} from "./records.enums";
import {IRecord} from "./records.interface";

@Injectable({
  providedIn: 'root'
})
export class RecordsService {
  private _record: BehaviorSubject<IRecord | null> = new BehaviorSubject<IRecord | null>(null);
  private _records: BehaviorSubject<IRecord[]> = new BehaviorSubject<IRecord[]>([]);
  private _recordPlaying: BehaviorSubject<IRecord | null> = new BehaviorSubject<IRecord | null>(null);
  private _recordState: BehaviorSubject<ERecordsState> = new BehaviorSubject<ERecordsState>(ERecordsState.Stop);
  private _wsInput: WebSocket | null = null
  private _wsOnput: WebSocket | null = null

  constructor(private zone: NgZone) {
  }

  get recordPlaying(): BehaviorSubject<IRecord | null> {
    return this._recordPlaying;
  }

  setRecordPlaying(value: IRecord) {
    this._recordPlaying.next(value);
  }

  get records(): BehaviorSubject<IRecord[]> {
    return this._records;
  }

  setRecords(value: IRecord[]) {
    this._records.next(value);
  }

  get record(): BehaviorSubject<IRecord | null> {
    return this._record;
  }

  get recordState(): BehaviorSubject<ERecordsState> {
    return this._recordState;
  }

  set recordState(value: BehaviorSubject<ERecordsState>) {
    this._recordState = value;
  }

  private onRegisterInputWS(): void {
    this._wsInput = new WebSocket(EWS.UrlInput);
    this.registerEventsInput();
    this.handleRecord();
  }

  private onRegisterOutputWS(): void {
    this._wsOnput = new WebSocket(EWS.UrlOutput);
    this.registerEventsOutput()
  }

  public onStartRecord(): void {
    if (this._wsInput || this._wsOnput) {
      return;
    }

    this.onRegisterInputWS();
    this.onRegisterOutputWS()
  }

  public onStopRecord(): void {
    this.handleStopRecord();
  }

  private registerEventsInput(): void {
    if (!this._wsInput) {
      return;
    }
    this._wsInput.onopen = () => {
      console.log('Connected Input');
      this._recordState.next(ERecordsState.Start);
    }
    this._wsInput.onclose = () => {
      console.log('Disconnected Input');
      this._recordState.next(ERecordsState.Stop);
      this._wsInput = null;
    }
    this._wsInput.onerror = (error: Event) => {
      console.log('Error Input', error);
      this._recordState.next(ERecordsState.Stop);
      this._wsInput = null;
    }
    this._wsInput.onmessage = (message: MessageEvent) => {
      // console.log('OnMessage Input', message.data);
      // const dataFakeReceived: IRecord = {
      //   sourceText: " Halo, halo, halo.",
      //   targetText: "Halo, halo, halo.",
      //   audioPath: "https://www.mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/Samples/AFsp/M1F1-Alaw-AFsp.wav",
      //   actions: ""
      // }
      // this._record.next(dataFakeReceived);
    }
  }

  private handleRecord(): void {
    if (!this._wsInput) {
      return;
    }
    const websocket = this._wsInput;
    this.zone.runOutsideAngular(() => {
      navigator.mediaDevices.getUserMedia(constraints).then((stream: MediaStream) => {
        const audioContext = new AudioContext({sampleRate: ERecorsSteam.SampleRate});
        const audioSource = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(ERecorsSteam.BufferSize, ERecorsSteam.NumberOfInputChannels, ERecorsSteam.NumberOfOutputChannels);

        audioSource.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        scriptProcessor.onaudioprocess = (e) => {
          const audioChunk = e.inputBuffer.getChannelData(0);
          const audioData = new Int16Array(audioChunk.length);
          for (let i = 0; i < audioChunk.length; i++) {
            audioData[i] = audioChunk[i] * 32767; // Convert to 16-bit PCM
          }

          // Send the audio chunk to the server
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.send(audioData);
          }
        };
      })
    })
  }

  private handleStopRecord(): void {
    if (!this._wsInput || !this._wsOnput) {
      return;
    }
    this._wsInput.close();
    this._wsInput = null;

    this._wsOnput.close();
    this._wsOnput = null;

    this._recordState.next(ERecordsState.Stop);
  }


  private registerEventsOutput(): void {
    if (!this._wsOnput) {
      return;
    }
    this._wsOnput.onopen = () => {
      console.log('Connected Output');
    }
    this._wsOnput.onclose = () => {
      console.log('Disconnected Output');
      this._wsOnput = null;
    }
    this._wsOnput.onerror = (error: Event) => {
      console.log('Error Output', error);
      this._wsOnput = null;
    }
    this._wsOnput.onmessage = (message: MessageEvent) => {
      // console.log('OnMessage Output', message.data);
      const dataReceived = JSON.parse(message.data) as IRecord
      dataReceived.receivedAt = new Date().toISOString();
      this._record.next(dataReceived);
    }
  }
}
