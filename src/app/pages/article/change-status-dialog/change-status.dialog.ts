import {Component, Inject} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent, MatDialogRef,
} from "@angular/material/dialog";
import {HasErrors} from "src/app/core/abstract/has-errors";
import {CoreModule} from "src/app/core/core.module";
import {ContentService, Status} from "app/core/service/content/content.service";
import {takeUntil} from "rxjs";
import {MatButton} from "@angular/material/button";
import {TranslateModule} from "@ngx-translate/core";

export interface DialogData {
  id: string;
  status: Status
}

@Component({
  selector: 'change-status-dialog',
  templateUrl: './change-status.dialog.html',
  styleUrl: './change-status.dialog.less',
  standalone: true,
  imports: [CoreModule, MatDialogContent, MatDialogActions, MatButton, TranslateModule],
})
export class ChangeStatusDialog extends HasErrors {

  constructor(
    private dialogRef: MatDialogRef<ChangeStatusDialog>,
    @Inject(MAT_DIALOG_DATA) protected data: DialogData,
    private contentService: ContentService) {
    super();
  }

  submit(): void {
    this.contentService.changeStatus(this.data.id, this.data.status)
      .pipe(takeUntil(this.unSubscriber))
      .subscribe({
        next: () => this.dialogRef.close(true)
      });
  }

  close() {
    this.dialogRef.close();
  }
}