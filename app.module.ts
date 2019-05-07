import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationMenuModule, NAV_MENU_SERVICE, DefaultNavigationMenuService } from 'lib-platform-components';
import { UserService, LocalStorageService } from 'lib-platform-services';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { GrowlModule } from 'primeng/growl';
import { MessageService } from 'primeng/components/common/messageservice';
import { ErrorComponent } from './error/error.component';
import { AppService } from './app.service';
import { HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';
import { CacheRouteReuseStrategy } from './employees/cacheRouteReuseStrategy';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent,
  ],
  imports: [
    AppRoutingModule,
    BreadcrumbModule,
    BrowserModule,
    ConfirmDialogModule,
    GrowlModule,
    HttpClientModule,
    NavigationMenuModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([])
  ],
  providers: [
    AppService,
    ConfirmationService,
    LocalStorageService,
    MessageService,
    UserService,
    {
      provide: NAV_MENU_SERVICE,
      useClass: DefaultNavigationMenuService
    }, {
      provide: RouteReuseStrategy,
      useClass: CacheRouteReuseStrategy
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
