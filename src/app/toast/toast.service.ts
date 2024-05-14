import { Injectable } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  constructor(
    private _snackBar: MatSnackBar
  ) { }

  public openToast(message: string, action: string = '', duration: number = 2000): void {
    this._snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
