import {Component, ElementRef, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ContentService, Status} from "app/core/service/content/content.service";
import {ActivatedRoute, Router} from "@angular/router";
import {debounceTime, delay, distinctUntilChanged, map, mergeMap, Observable, of, skipWhile, takeUntil} from "rxjs";
import {DeviceDetectorService} from "ngx-device-detector";
import {Editor, NgxEditorModule, Toolbar, Validators} from "ngx-editor";
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {HasErrors} from "app/core/abstract/has-errors";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MaskitoOptions} from "@maskito/core";
import {CommonModule} from "@angular/common";
import {animations} from "app/core/config/app.animations";
import {Content} from "app/core/service/content/content";
import {Actions} from "app/core/service/content/actions";
import {MatDialog} from "@angular/material/dialog";
import {ChangeStatusDialog} from "app/pages/content/change-status-dialog/change-status.dialog";
import {DeleteDialog} from "app/pages/content/delete-dialog/delete.dialog";
import {AuthService} from "app/core/service/auth/auth.service";
import {Tag, TagService, TagsFilter} from "app/core/service/content/tag.service";
import {CoreModule} from "app/core/core.module";
import hash from 'hash-it';
import {ConfirmCloseDialog} from "app/pages/content/confirm-close-dialog/confirm-close.dialog";
import {ImageUploadMenuComponent} from "app/core/ngx-editor-plugins/image-upload/image-upload-menu.component";
import {SafeHtmlService} from "app/core/pipe/safe-html";
import {ThemeDataService} from "app/core/service/theme-data.service";
import {EmojiMenuComponent} from "app/core/ngx-editor-plugins/emoji/emoji-menu.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'edit-content',
  standalone: true,
  animations: animations,
  imports: [
    CommonModule,
    CoreModule,
    ReactiveFormsModule,
    ImageUploadMenuComponent,
    NgxEditorModule,
    EmojiMenuComponent,
  ],
  templateUrl: './edit-content.component.html',
  styleUrl: './edit-content.component.less'
})
export class EditContentComponent extends HasErrors implements OnInit {

  protected content: Content = {
    tags: new Array<string>(),
    actions: {
      canEdit: true
    } as Actions
  } as Content;
  protected state: 'form' | 'load' = 'form';
  protected editor: Editor | undefined;

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike', 'code', 'blockquote',
      'align_left', 'align_center', 'align_right', 'align_justify',
      {heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']},
      'link'],
  ];
  shortToolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike', 'code', 'blockquote',
      'link'],
  ];

  protected separatorKeysCodes: number[] = [ENTER, COMMA];
  protected filteredTags: Tag[] = [];
  protected id: string = '';
  readonly maskitoOpt: MaskitoOptions = {
    mask: /[a-zA-Zа-яА-Я0-9_]/,
    preprocessors: [
      ({elementState, data}) => ({data: data.replaceAll(/[^a-zA-Z0-9А-Яа-я_]|\d/g, ''), elementState}),
    ]
  };

  @ViewChild('tagsInput')
  protected tagsInput: ElementRef<HTMLInputElement> | undefined;

  protected readonly Status = Status;
  private hash: number = 0;
  private tagHash: number = 0;

  private contentService: ContentService;
  protected tagService: TagService;
  protected deviceService: DeviceDetectorService;
  private router: Router;
  protected authService: AuthService;
  protected matDialog: MatDialog;
  protected theme: ThemeDataService;
  private safeHtmlService: SafeHtmlService;
  private aRouter: ActivatedRoute;

  constructor() {
    super();

    this.contentService = inject(ContentService);
    this.tagService = inject(TagService);
    this.deviceService = inject(DeviceDetectorService);
    this.router = inject(Router);
    this.authService = inject(AuthService);
    this.matDialog = inject(MatDialog);
    this.theme = inject(ThemeDataService);
    this.safeHtmlService = inject(SafeHtmlService);
    this.aRouter = inject(ActivatedRoute);
  }

  get tagCtrl(): FormControl {
    return this.formGroup.get("tagCtrl") as FormControl;
  }

  get titleLength(): number {
    return this.formGroup.get('title')?.value?.length || 0;
  }

  get isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  ngOnInit(): void {
    this.formGroup.addControl('content', new FormControl('<p></p>', Validators.required()));
    this.formGroup.addControl('title', new FormControl("", Validators.required()));
    this.formGroup.addControl('tagCtrl', new FormControl(""));
    this.translate.get('editContentPage.metaTitle').subscribe({next: (it) => this.title.setTitle(it)});

    this.editor = new Editor({
      keyboardShortcuts: true,
      features: {
        resizeImage: true
      }
    });

    this.id = this.aRouter.snapshot.params['id'];

    if (this.id) {
      this.init();
    } else {
      this.calculateHash();
    }

    this.tagCtrl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      skipWhile(val => val == null || val?.toString()?.length < 3),
      takeUntil(this.unSubscriber),
      mergeMap(val => val?.toString()?.length < 3 ? of([]) : this.tagService.list({max: 5, query: val} as TagsFilter)),
    ).subscribe({
      next: value => {
        this.filteredTags = [];

        value.forEach((it): void => {
          this.filteredTags.push(it);
        });

        if (this.filteredTags.length == 0 && this.tagCtrl.value) {
          this.filteredTags.push({value: "#" + this.tagCtrl.value, count: 0});
        }
      }
    });
  }

  canDeactivate(): Observable<boolean> {
    let res = (this.hash == hash(this.formGroup.getRawValue()) &&
      this.tagHash == hash(this.content.tags));

    if (!res) {
      return this.matDialog.open(ConfirmCloseDialog).afterClosed().pipe(
        map(it => {

          if (it === undefined) {
            it = false;
          }

          return it;
        })
      );
    }

    return of(res);
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.editor?.destroy();
  }

  protected submit(): void {

    if (this.validate()) {
      this.state = 'load';
      this.save()
        .pipe(
          takeUntil(this.unSubscriber),
        )
        .subscribe({
          next: it => {

            this.calculateHash();

            if (this.id != it.id) {
              this.id = it.id;
              this.router.navigate(['content', 'edit', it.id]).then();
            } else {
              this.state = 'form';
            }

          },
          error: err => {
            this.state = 'form';
            this.rejectErrors(...err.errors)
          }
        })
    }
  }

  protected add(): void {

    setTimeout(() => {

      if (this.tagsInput?.nativeElement.value) {
        this.content.tags.push('#' + this.tagsInput.nativeElement.value);
        this.tagCtrl.setValue(null);
        this.tagsInput.nativeElement.value = '';
      }
    }, 100)
  }

  protected remove(tag: string): void {
    const index = this.content.tags.indexOf(tag);

    if (index >= 0) {
      this.content.tags.splice(index, 1);
    }
  }

  protected selected(value: string): void {

    if (!this.content.tags.includes(value)) {
      this.content.tags.push(value.includes('#') ? value : '#' + value);
    }

    if (this.tagsInput?.nativeElement.value) {
      this.tagsInput.nativeElement.value = '';
    }

    this.tagCtrl.setValue(null);
  }

  protected changeStatus(status: Status) {

    if (this.content.status == status || status == null) {
      return;
    }

    let subs: Observable<any> = of({success: true});

    if (status == Status.published) {
      subs = this.save();
    }

    subs.pipe(
      mergeMap(() => this.matDialog.open(ChangeStatusDialog, {
        data: {
          id: this.content.id,
          status: status
        }
      }).afterClosed()),
      takeUntil(this.unSubscriber)
    )
      .subscribe({
        next: (it) => {

          if (it) {
            this.init();
          } else {
            this.state = 'form';
          }

        },
        error: (err) => {
          this.state = 'form';
          this.rejectErrors(...err.errors);
        }
      });
  }

  private init() {
    this.state = 'load';
    this.contentService.get(this.id)
      .pipe(takeUntil(this.unSubscriber))
      .subscribe({
        next: it => {
          this.content = it;

          if (this.content.title) {
            this.formGroup.get('title')?.setValue(this.content.title);
          }

          if (this.content.content) {
            this.formGroup.get('content')?.setValue(this.content.content);
          }

          if (!this.content.tags) {
            this.content.tags = [];
          }

          this.calculateHash();

          this.state = 'form';

          if (!this.content.actions?.canEdit) {
            this.formGroup.disable();
          } else {
            this.formGroup.enable();
          }
        },
        error: err => {
          this.state = 'form';
          this.rejectErrors(...err.errors);
        }
      });
  }

  protected delete() {
    this.matDialog.open(DeleteDialog, {
      data: {
        id: this.content.id
      }
    }).afterClosed().subscribe({
      next: it => {
        if (it) {
          this.calculateHash();
          this.router.navigate(['/']).then();
          return;
        }
      }
    });
  }

  private save(): Observable<{ success: boolean, id: string }> {

    if (this.id != '' && this.hash == hash(this.formGroup.getRawValue()) && this.tagHash == hash(this.content.tags)) {
      let res = {success: true, id: this.id};
      return of(res).pipe(delay(200));
    }

    if (this.tagCtrl.value && this.tagCtrl.value.length > 0 && this.content.tags.length == 0) {
      this.selected(this.tagCtrl.value);
    }

    return this.contentService.save({
      id: this.content.id,
      title: this.formGroup.get('title')?.value,
      content: this.safeHtmlService.sanitize(this.formGroup.get('content')?.value),
      tags: this.content.tags
    } as Content)
      .pipe(takeUntil(this.unSubscriber));
  }

  private calculateHash(): void {
    this.hash = hash(this.formGroup.getRawValue());
    this.tagHash = hash(this.content.tags);
  }
}
