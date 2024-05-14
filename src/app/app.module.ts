import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {AuthComponent} from './auth/auth.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from "@angular/material/dialog";
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatSnackBar} from "@angular/material/snack-bar";
import {JssipComponent} from './jssip/jssip.component';
import {RecordsComponent} from "./records/records.component";
import {MatTableModule} from '@angular/material/table';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    JssipComponent,
    RecordsComponent
  ],
  imports: [
    NoopAnimationsModule,
    BrowserModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatTableModule
  ],
  providers: [MatSnackBar],
  bootstrap: [AppComponent]
})
export class AppModule {
}
