import { RouteReuseStrategy } from '@angular/router/';
import { ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CacheRouteReuseStrategy implements RouteReuseStrategy {
    storedRouteHandles: Map<string, DetachedRouteHandle> = new Map<string, DetachedRouteHandle>();
    allowRetriveCache = {
        employees: true,
        'employees/:id': true
    };

    // TODO: This should probably be refactored and/or broken up into a root strategy and module strategies
    shouldReuseRoute(before: ActivatedRouteSnapshot, curr:  ActivatedRouteSnapshot): boolean {
        const sameRouteConfig: boolean = (before.routeConfig === curr.routeConfig) ||
            ((before.routeConfig.component === curr.routeConfig.component)
                && (before.routeConfig.path === curr.routeConfig.path));
        return sameRouteConfig ? sameRouteConfig :
            !!before.data.allowRouteReuse && before.data.allowRouteReuse.includes(this.getPath(curr));
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        return this.storedRouteHandles.get(this.getPath(route));
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        // const path = this.getPath(route);
        return this.storedRouteHandles.has(this.getPath(route));
    }

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        const path = this.getPath(route);
        return this.allowRetriveCache.hasOwnProperty(path);
    }

    store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
        this.storedRouteHandles.set(this.getPath(route), detachedTree);
    }

    private getPath(route: ActivatedRouteSnapshot): string {
        if (route.routeConfig !== null && route.routeConfig.path !== null) {
            return route.routeConfig.path;
        }
        return '';
    }
}