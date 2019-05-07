import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskmanagementAddEditTaskComponent } from './taskmanagement-addEdit-task.component';

describe('TaskmanagementAddEditTaskComponent', () => {
  let component: TaskmanagementAddEditTaskComponent;
  let fixture: ComponentFixture<TaskmanagementAddEditTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskmanagementAddEditTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskmanagementAddEditTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


