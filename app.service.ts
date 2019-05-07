import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { MenuItem } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  readonly ROOT_BREADCRUMB: MenuItem = {label: 'Administration', routerLink: '/'};
  private breadcrumbs$: Subject<MenuItem[]>;

  constructor() {
    this.breadcrumbs$ = new BehaviorSubject<MenuItem[]>([this.ROOT_BREADCRUMB]);
  }

  set breadcrumbs (items: MenuItem[]) {
    const breadcrumbs: MenuItem[] = [this.ROOT_BREADCRUMB].concat(items);
    this.breadcrumbs$.next(breadcrumbs);
  }

  getBreadcrumbObservable(): Observable<MenuItem[]> {
    return this.breadcrumbs$.asObservable();
  }

}
