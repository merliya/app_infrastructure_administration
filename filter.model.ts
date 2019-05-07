import { EventEmitter } from '@angular/core';
import { Observable, Subject, merge } from 'rxjs';
import { switchMap, map, filter } from 'rxjs/operators';

export interface Filter {
    name: string;
    field: string;
    type: FilterType;
    model: string[];
    isActive(): boolean;
    reset(): void;
}

export enum FilterType {
    CHECKBOX = 'CHECKBOX',
    ELASTIC = 'ELASTIC'
}

export interface FilterOptions {
    indexOf: any;
    label: string;
    value: string;
}

export class CheckboxFilter implements Filter {
    name: string;
    field: string;
    type: FilterType;
    options: Array<{label: string, value: string }>;
    defaultOptionLabelName: string;
    showSearchOverride: boolean = false;
    model: string[] = [];
    searchText: string;
    selectedSearches: string[];
    suggestions: string[] = [];

    constructor(name: string, field: string, defaultOptionLabel?: string, options?: Set<string>,
        optionWithKeyAndValue?: Array<FilterOptions>, defaultModel?: string[]) {
        this.name = name;
        this.field = field;
        this.defaultOptionLabelName = defaultOptionLabel;
        if (options && options.size > 0) {
            const filterOptions = Array.from(options).map(option => {
                return { label: option, value: option };
            });
            this.options = filterOptions;
        } else {
            this.options = [];
        }
        if (optionWithKeyAndValue && optionWithKeyAndValue.length > 0) {
            this.options = optionWithKeyAndValue;
        }
        if (defaultModel && defaultModel.length > 0) {
            this.model = defaultModel;
        }
        this.type = FilterType.CHECKBOX;
        return this;
    }

    isActive(): boolean {
        return this.model.length > 0;
    }

    reset(): void {
        if (this.defaultOptionLabelName) {
            const defaultOption = this.options.find(option => option.label === this.defaultOptionLabelName);
            this.model = [defaultOption.value];
        } else {
            this.model = [];
        }
        this.searchText = '';
    }

    filterValues( values: any[] ): any[] {
        return values.filter( value =>
            this.model.includes(value[this.field])
        );
    }

    search(event: any): void {
        this.suggestions = [];
        this.options.forEach((option: { label: string, value: string }) => {
            if (option.value.indexOf(event.query) > -1) {
                    this.suggestions.push(option.value);
            }
        });
    }

    searchSelected(value: any, filterChangeEmitter: EventEmitter<Filter> ) {
        if (!this.selectedSearches) {
            this.selectedSearches = [];
        }
        this.selectedSearches.push(value);
        this.model.push(value);
        this.searchText = '';
        filterChangeEmitter.emit( this );
    }
}

export class ElasticFilter implements Filter {
    name: string;
    field: string;
    type: FilterType;
    model: string[] = [];
    searchText: string;
    selectedSearches: string[] = [];
    searchMethod: SearchServiceMethod;
    search$: Subject<string> = new Subject();

    constructor( name: string, field: string, searchMethod: SearchServiceMethod ) {
        this.name = name;
        this.field = field;
        this.searchMethod = searchMethod;
        this.type = FilterType.ELASTIC;
        return this;
    }

    get suggestionSubject(): Observable<string[]> {
        return this.search$.pipe(
            switchMap(query => this.searchMethod(query)),
            map(results => results.filter((v, i, a) => a.indexOf(v) === i)));
    }

    isActive(): boolean {
        return this.model.length > 0;
    }

    reset(): void {
        this.model = [];
        this.selectedSearches = [];
        this.searchText = null;
    }

    search( query: any ): void {
        this.search$.next(query);
    }

    searchSelected(value: any, filterChangeEmitter: EventEmitter<Filter>, searchBox: any ) {
        let changed: boolean = false;
        if (!this.selectedSearches.includes(value)) {
            this.selectedSearches.push(value);
            changed = true;
        }
        if (!this.model.includes(value)) {
            this.model.push(value);
            changed = true;
        }
        this.searchText = null;
        searchBox.inputEL.nativeElement.value = null;
        searchBox.value = null;
        if (changed) {
            this.model = [].concat(this.model); // Force UI to update boxes checked
            filterChangeEmitter.emit( this );
        }
    }
}

type SearchServiceMethod = (query: any) => Observable<string[]>;