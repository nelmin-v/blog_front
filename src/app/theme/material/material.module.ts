import {NgModule} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatFabButton} from "@angular/material/button";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatDrawer, MatDrawerContainer, MatSidenavModule} from "@angular/material/sidenav";
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {MatListModule} from "@angular/material/list";
import {MatLine, MatRipple} from "@angular/material/core";
import {MatCardModule} from "@angular/material/card";
import {
  MatStep,
  MatStepLabel,
  MatStepper,
  MatStepperModule,
  MatStepperNext,
  MatStepperPrevious
} from "@angular/material/stepper";
import {MatFormField, MatFormFieldModule, MatHint, MatLabel} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatGridListModule} from '@angular/material/grid-list';
import {MatChipsModule} from '@angular/material/chips';
import {MatBadge} from "@angular/material/badge";
import {MatMenuModule} from "@angular/material/menu";

@NgModule({
  declarations: [],
  imports: [
    MatFabButton,
    MatDrawerContainer,
    MatDrawer,
    MatLine,
    MatFormField,
    MatInput,
    MatStepper,
    MatStep,
    MatStepLabel,
    MatFormField,
    MatStepperPrevious,
    MatStepperNext,
    MatInput,
    MatLabel,
    MatHint,
    MatIcon,
    MatProgressSpinner,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBar,
    MatBadge,
    MatRipple
  ],
  exports: [
    MatSidenavModule,
    MatButtonModule,
    MatTableModule,
    MatFabButton,
    MatIconModule,
    MatButtonModule,
    MatBottomSheetModule,
    MatListModule,
    MatLine,
    MatCardModule,
    MatStepperModule,
    MatStepper,
    MatStep,
    MatStepLabel,
    MatFormField,
    MatStepperPrevious,
    MatStepperNext,
    MatInput,
    MatLabel,
    MatHint,
    MatIcon,
    MatIconModule,
    MatProgressSpinner,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressBar,
    MatGridListModule,
    MatChipsModule,
    MatBadge,
    MatRipple,
    MatMenuModule
  ]
})
export class MaterialModule {
}