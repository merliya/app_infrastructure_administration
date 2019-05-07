import { NgModule, Injectable } from '@angular/core';
import { Routes, RouterModule, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from 'lib-platform-services';
import { Observable, of } from 'rxjs';
import { ErrorComponent } from './error/error.component';


const routes: Routes = [
  {
    path: 'employees/:id',
    loadChildren: './employees/employees.module#EmployeesModule',
    data: {
      allowRouteReuse: [ 'employees' ]
    }
  },
  {
    path: 'employees',
    loadChildren: './employees/employees.module#EmployeesModule',
    data: {
      allowRouteReuse: [ 'employees/:id' ]
    }
  },
  {
    path: 'taskmanagement',
    loadChildren: './task-management/task-management.module#TaskmanagementModule'
  },
  {
    path: 'team-management',
    loadChildren: './team-management/team-management.module#TeamManagementModule'
  },
  {
    path: 'error/:code',
    component: ErrorComponent
  },
  {
    path: '',
    redirectTo: 'employees',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'error/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
