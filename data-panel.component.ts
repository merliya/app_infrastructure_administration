import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { CheckboxFilter, Filter } from '../filter-panel/filter/filter.model';
import { RightPanelHelper } from './RightPanelHelper';
import { Table } from 'primeng/table';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'shared-data-panel',
  templateUrl: './data-panel.component.html',
  styleUrls: ['./data-panel.component.scss']
})
export class DataPanelComponent implements OnInit, OnChanges {

  @Input('values')
  values: any[];

  @Input('columns')
  columns: DataPanelColumn[];

  @Input('panel-title')
  dataPanelTitle: string;

  @Input('total-records')
  totalRecords: number;

  @Input('search-callback')
  searchCallback: Function;

  @Input('filters')
  filters: Filter[];

  @Input('rows-per-page')
  rowsPerPage: number = 25;

  @Input('first-row')
  firstRow: number = 0;

  @Input('right-panel-helper')
  rightPanelHelper: RightPanelHelper;

  @Input('search-state')
  searchTerm: string;

  @Input('filter-state')
  activeFilters: Filter[] = [];

  @Input('panel-buttons')
  buttons: PanelButton[];

  @Input('checkbox-config')
  checkboxConfig: CheckboxConfig;

  @Input('overflow-menu')
  overflowMenu: MenuItem[];

  @Output('onRowSelect')
  rowSelectedHandler: EventEmitter<any> = new EventEmitter<any>();

  @Output('onColumnSelect')
  columnSelectedHandler: EventEmitter<any> = new EventEmitter<any>();

  @Output('onPageChange')
  pageChangeHandler: EventEmitter<any> = new EventEmitter<any>();

  @Output('onSearch')
  searchChangeHandler: EventEmitter<any> = new EventEmitter<any>();

  @Output('onFilter')
  filterChangeHandler: EventEmitter<Filter[]> = new EventEmitter<Filter[]>();

  @ViewChild('dataPanelTable')
  table: Table;

  originalValues: any[];
  displayFilterPanel: boolean = false;
  displayRightPanel: boolean = false;
  selectedRow: any;
  selectedColumn: {
    columnName: string | null,
    direction: 'asc' | 'desc'
  } = {
    columnName: null,
    direction: 'asc'
  };
  loading: boolean;
  hasCheckboxes: boolean;

  headCheckbox = {
    checked: false,
    focused: false
  };

  constructor() {
  }

  ngOnInit() {
    if (!this.values && !this.columns) {
      throw new Error('Attribute values is required. If values.length is zero then attribute columns must set.');
    }
    if (!this.rightPanelHelper) {
      throw new Error('RightPanelHelper not set. Without it, the right panel can\'t close.');
    }

    this.searchChangeHandler.subscribe(event => {
      this.searchTerm = event;
      if (this.searchChangeHandler.observers.length <= 1) {
        this.defaultSearch(event);
      }
    });

    if (this.filterChangeHandler.observers.length <= 0) {
      this.filterChangeHandler.subscribe(filters => {
        if (!this.originalValues) {
          this.originalValues = this.values;
        } else {
          this.values = this.originalValues;
        }

        filters.forEach(filter => this.values = (filter as CheckboxFilter).filterValues(this.values))
      });
    }

    this.rightPanelHelper.rightPanelState.subscribe(isOpen => {
      this.displayRightPanel = isOpen;
      if (!isOpen) {
        this.selectedRow = {};
      }
    });
  }

  ngOnChanges() {
    if (!this.values) {
      this.loading = true;
      return;
    }

    this.hasCheckboxes = !!this.checkboxConfig && this.checkboxConfig.hasAccess;
    this.loading = false;
    this.columns = this.columns || this.assumeColumnHeaders();
    this.totalRecords = this.totalRecords || this.values.length;
    this.filters = this.filters || this.defaultFilters();
    const excelMenuItemIndex = this.overflowMenu ? this.overflowMenu.findIndex(item => item.label === 'Export to Excel') : -1;
    if (excelMenuItemIndex > -1) {
      this.overflowMenu[excelMenuItemIndex].command = () => {this.table.exportCSV();}
    }
  }

  onPageChange(event) {
    this.firstRow = event.first;
    this.rowsPerPage = event.rows;
    this.pageChangeHandler.emit(event);
  }

  onRowSelect(event) {
    this.rightPanelHelper.setOpen();
    this.rowSelectedHandler.emit(event.data);
  }

  onColumnSelect(column) {
    this.firstRow = 0;
    this.updateSelectedColumn(column);
    this.columnSelectedHandler.emit({
      columnName: column,
      rowsPerPage: this.rowsPerPage
    });
  }

  onFilterChange(filter: Filter) {
    let activeFilterIndex = this.activeFilters.indexOf(filter);

    if (filter.isActive() && activeFilterIndex === -1) {
      this.activeFilters.push(filter);
    } else if (!filter.isActive() && activeFilterIndex > -1) {
      this.activeFilters.splice(this.activeFilters.indexOf(filter), 1);
    }

    this.filterChangeHandler.emit(this.activeFilters);
  }

  onFilterButtonClick() {
    if (this.displayFilterPanel) {
      //Clear the filters?
    }
    this.displayFilterPanel = !this.displayFilterPanel
  }

  buildTitleForTd( value: string | string[] ): string {
    if (Array.isArray(value)) {
      return value.join('\n');
    }
    return value;
  }

  headCheckboxChanged( event: Event ) {
    this.headCheckbox.checked = (<HTMLInputElement> event.target).checked;
  }

  headCheckboxClicked( event: Event, checkbox: HTMLInputElement ) {
    event.stopPropagation();
    this.headCheckbox.checked = !this.headCheckbox.checked;
    for (const row of this.values) {
      row.checked = this.headCheckbox.checked;
    }
    this.checkboxConfig.checkboxCallback(this.headCheckbox.checked ? this.values : []);
    checkbox.focus();
  }

  headCheckboxFocused() {
    this.headCheckbox.focused = true;
  }

  headCheckboxBlurred() {
    this.headCheckbox.focused = false;
  }

  checkBoxChanged( event: Event, row: any ) {
    row.checked = (<HTMLInputElement> event.target).checked;
  }

  checkBoxClicked( event: Event, row: any, checkbox: HTMLInputElement ) {
    event.stopPropagation();
    row.checked = !row.checked;
    if (this.headCheckbox.checked && !row.checked) {
      this.headCheckbox.checked = false;
    }
    this.checkboxConfig.checkboxCallback(this.values.filter(val => val.checked));
    checkbox.focus();
  }

  checkBoxFocused( row: any ) {
    row.focused = true;
  }

  checkBoxBlurred( row: any ) {
    row.focused = false;
  }

  private updateSelectedColumn(column: string) {
    if (this.selectedColumn.columnName === column && this.selectedColumn.direction === 'asc') {
      this.selectedColumn.direction = 'desc';
    }
    else {
      this.selectedColumn = {
        columnName: column,
        direction: 'asc'
      };
    }
  }

  private assumeColumnHeaders(): DataPanelColumn[] {
    let firstValue = this.values[0];
    let columnList: any[] = [];
    Object.keys(firstValue).map(key => {
      columnList.push(
        {
          field: key,
          header: key.replace(/([A-Z]+)/g, ' $1')                   //This takes the key and puts a space before a group of capitals
            .replace(/([A-Z][a-z])/g, ' $1')               //or before a capital followed by a lowercase character
            .replace(/^./, (match) => match.toUpperCase()) //then capitalizes the first character
            .trim()                                          //and trims any leading or trailing whitespace
        }
      )
    });
    return columnList;
  }

  private defaultFilters(): Filter[] {
    let filters: Filter[] = [];
    let tempFilter: Filter;
    this.values.forEach(value => {
      this.columns.forEach((column: DataPanelColumn) => {
        tempFilter = filters.find((filter: Filter) => filter.field === column.field);
        if (!tempFilter) {
          tempFilter = new CheckboxFilter(column.header, column.field);
          filters.push(tempFilter);
        }
        (tempFilter as CheckboxFilter).options.push({ label: value[column.field], value: value[column.field] });
      });
    });

    return filters;
  }

  private defaultSearch(event): any[] {
    if (!this.originalValues) this.originalValues = this.values
    else this.values = this.originalValues

    let tolkiens: string[] = event.split(" ").filter(token => token.length > 0);
    let tokenCount: number = tolkiens.length;
    let matchCount: number;
    return this.values.filter((value: Object) => {
      matchCount = 0;
      tolkiens.forEach(token => {
        if (token.length === 0) {
          tokenCount--;
        } else {
          Object.keys(value).map(key => value[key]).forEach(val => {
            val = '' + val; // make val be a string, no matter what
            if (val === token || val.indexOf(token) > -1) { matchCount++; }
          });
        }
      });
      return matchCount >= tokenCount;
    });
  }
}

export interface DataPanelColumn {
  field: string;
  header: string;
  style?: any;
  interpretHTML?: boolean;
  sortable?: boolean;
  isList?: boolean;
}

export interface PanelButton {
  label: string;
  click?: Function;
  style?: string;
  hide?: boolean;
}

export interface CheckboxConfig{
  checkboxCallback: Function;
  hasAccess: boolean;
}

@Component({
  selector: 'data-panel-right',
  template: '<ng-content></ng-content>'
})
export class DataPanelRight { }
