import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataPanelComponent, DataPanelRight } from './data-panel/data-panel.component';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';
import { PhoneNumberPipe } from './pipes/phoneNumber.pipe';

import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { FilterComponent } from './filter-panel/filter/filter.component';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [DataPanelComponent, DataPanelRight, FilterPanelComponent, PhoneNumberPipe, FilterComponent],
  imports: [
    AccordionModule,
    AutoCompleteModule,
    CheckboxModule,
    CommonModule,
    InputTextModule,
    MenuModule,
    PaginatorModule,
    PanelModule,
    TableModule,
    ButtonModule
  ],
  exports: [
    DataPanelComponent,
    DataPanelRight,
    PhoneNumberPipe
  ]
})
export class SharedModule { }
