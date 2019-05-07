import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  readonly errorMaps: Map<number, ErrorMap> = new Map([
    [404, {
      title: "Page Not Found",
      icon: "icon-Circle_Question",
      explanation: "The page you are looking for has moved or doesn't exist",
      template: "notFound"
    }],[401, {
      title: "Authorization Required",
      icon: "icon-Padlock_Locked_Solid",
      explanation: "Your account needs authorization to access this page.",
      template: "notAutorized"
    }]
  ])

  error: ErrorMap;
  private paramSub: Subscription;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.paramSub = this.route.paramMap.subscribe((paramsMap: ParamMap) => {
      let code: number = Number(paramsMap.get('code'));
      if( code && this.errorMaps.has(code) ) {
        this.error = this.errorMaps.get(code);
      } else {
        this.error = this.errorMaps.get(404);
      }
    })
  }
}

interface ErrorMap {
  title: string;
  icon: string;
  explanation: string;
  template: string;
}