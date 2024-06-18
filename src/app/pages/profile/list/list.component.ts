import {Component, OnInit} from '@angular/core';
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {CoreModule} from "src/app/core/core.module";
import {HasErrors} from "src/app/core/abstract/has-errors";
import {mergeMap, takeUntil} from "rxjs";
import {DeviceDetectorService} from "ngx-device-detector";
import {MatSnackBar, MatSnackBarRef} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {ContentService, Filter, Search, Status} from "src/app/core/service/content/content.service";
import {AuthService} from "src/app/core/service/auth/auth.service";
import {UserInfo} from "src/app/core/service/auth/user-info";
import {DeleteDialog} from "app/pages/article/delete-dialog/delete.dialog";
import {Article} from "app/core/service/content/article";
import {ChangeStatusDialog} from "app/pages/article/change-status-dialog/change-status.dialog";
import {EditPreviewDialog} from "app/pages/article/edit-preview-dialog/edit-preview-dialog.component";

@Component({
  selector: 'user-article-list',
  standalone: true,
  imports: [CoreModule, ReactiveFormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.less'
})
export class ListComponent extends HasErrors implements OnInit {

  constructor(private contentService: ContentService,
              private authService: AuthService,
              private snackBar: MatSnackBar,
              public dialog: MatDialog,
              private deviceService: DeviceDetectorService) {
    super();
  }

  protected state: 'data' | 'load' | 'empty' = 'load';
  protected list: Array<Article> = [];
  protected totalPages: number = 0;
  protected info: UserInfo = {} as UserInfo;
  protected sortBy: Array<string> = [];
  protected max: number = 10;
  protected page: number = 0;
  private ref: MatSnackBarRef<any> | null = null;
  protected readonly Status = Status;

  get isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  override ngOnDestroy() {
    this.ref?.dismiss();
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    this.formGroup.addControl('search', new FormControl(''));
    this.init();
  }

  delete(id: string) {
    this.dialog.open(DeleteDialog, {
      data: {id}
    }).afterClosed()
      .pipe(takeUntil(this.unSubscriber))
      .subscribe({
        next: (it) => it ? this.init() : null
      });
  }

  changeStatus(id: string, status: Status) {
    this.state = 'load';
    this.dialog.open(ChangeStatusDialog, {
      data: {status: status, id: id}
    }).afterClosed().pipe(
      takeUntil(this.unSubscriber),
    ).subscribe({
      next: (it) => {

        if (it) {
          this.init();
        } else {
          this.state = 'data';
        }
      }
    });
  }

  private init() {
    this.state = 'load';
    this.authService.info()
      .pipe(
        takeUntil(this.unSubscriber),
        mergeMap(val => {
          this.info = val;
          return this.contentService.all({
            max: this.max,
            page: this.page,
            sortBy: this.sortBy,
            search: {
              author: this.info.nickname
            } as Search
          } as Filter)
        })
      )
      .subscribe({
        next: it => {
          this.list = it.list;
          this.totalPages = it.totalPages;

          if (this.list.length === 0) {
            this.state = 'empty';
          } else {
            this.state = 'data';
          }
        },
        error: () => this.state = 'load'
      });
  }

  editPreview(id: string, content: string) {
    this.state = 'load';
    this.dialog.open(EditPreviewDialog, {
      data: {id: id, content: content}
    }).afterClosed().pipe(
      takeUntil(this.unSubscriber),
    ).subscribe({
      next: (it) => {
        if (it) {
          this.init();
        } else {
          this.state = 'data';
        }
      }
    })
  }
}
