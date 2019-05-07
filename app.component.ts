import { Component } from '@angular/core';
import { NavigationMenuItem } from 'lib-platform-components';
import { MenuItem } from 'primeng/api';
import { AppService } from './app.service';

@Component({
  selector: 'admin-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  sidebarPinned: boolean = true;
  msgs: any;

  menuItems: NavigationMenuItem[] = [
    new NavigationMenuItem('User Management', 'icon-User_Profile_Solid', {routerPath: '/employees'}),
    new NavigationMenuItem('Team Management', 'icon-User_Group_Solid', { routerPath: '/team-management'}),
    new NavigationMenuItem('Task Management', 'icon-Document_List', { routerPath: '/taskmanagement' }),
    new NavigationMenuItem('Notification Management', 'icon-Notification', { url: 'old/notificationsetup/nonedi/list'}),
    new NavigationMenuItem('EDI Notification Management', 'icon-Contact_Mail', { url: 'old/notificationsetup/edi/list'}),
    new NavigationMenuItem('Role Management', 'icon-Clipboard_Check', { url: 'old/roleassignment'}),
    new NavigationMenuItem('Task Category Management', 'icon-List', { url: 'old/taskgroup'}),
    new NavigationMenuItem('Developer Error Reprocessing', 'icon-Circle_Warning', { url: 'old/messageReprocessing'})
  ];

  breadcrumbItems: MenuItem[];

  constructor(private appService: AppService) {
    this.appService.getBreadcrumbObservable().subscribe( breadcrumbs => this.breadcrumbItems = breadcrumbs);
  }

  onMenuError($error: any) {
    console.error($error);
  }

  onMenuPin($event: boolean): void {
    this.sidebarPinned = $event;
  }
}
