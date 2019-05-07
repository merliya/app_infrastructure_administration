import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeesComponent } from './employees.component';
import { EmpolyeesRoutingModule } from './employees-routing.module';
import { EmployeesService } from './employees.service';
import { SharedModule } from '../shared/shared.module';
import { ScheduleComponent } from './schedule/schedule.component';
import { TaskDelegationComponent } from './task-delegation/task-delegation.component';

import { AutoCompleteModule} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { RouteReuseStrategy } from '@angular/router';
import { CacheRouteReuseStrategy } from './cacheRouteReuseStrategy';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { ScheduleFormComponent } from './schedule/schedule-form/schedule-form.component';

@NgModule({
  declarations: [EmployeesComponent, ScheduleComponent, TaskDelegationComponent, ScheduleFormComponent],
  imports: [
    EmpolyeesRoutingModule,
    AutoCompleteModule,
    ButtonModule,
    CalendarModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    OverlayPanelModule,
    PanelModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    SharedModule,
    TableModule,
    DialogModule,
    DropdownModule,
    MessageModule
  ],
  providers: [
    EmployeesService,
    {
      provide: RouteReuseStrategy,
      useClass: CacheRouteReuseStrategy
    }
  ]
})
export class EmployeesModule { }
