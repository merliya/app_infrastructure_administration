import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Filter, FilterType, ElasticFilter, CheckboxFilter } from './filter.model';

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  @Input()
  filter: Filter;

  @Output()
  optionClick: EventEmitter<Filter> = new EventEmitter<Filter>();

  suggestions: string[];

  constructor() { }

  ngOnInit() {
    switch (this.filter.type) {
      case FilterType.ELASTIC:
        this.setupElasticFilter(this.filter as ElasticFilter);
        break;
      case FilterType.CHECKBOX:
        this.setupCheckboxFilter(this.filter as CheckboxFilter);
        break;
    }
  }

  setupElasticFilter(filter: ElasticFilter) {
    filter.suggestionSubject.subscribe((results: string[]) => this.suggestions = results);
  }

  setupCheckboxFilter( filter: CheckboxFilter ) {
    //no-op
  }

}
