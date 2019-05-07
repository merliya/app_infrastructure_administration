import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskmanagementDetailComponent } from './taskmanagement-detail.component';

describe('TaskmanagementDetailComponent', () => {
  let component: TaskmanagementDetailComponent;
  let fixture: ComponentFixture<TaskmanagementDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskmanagementDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskmanagementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
