import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDelegationComponent } from './task-delegation.component';

describe('TaskDelegationComponent', () => {
  let component: TaskDelegationComponent;
  let fixture: ComponentFixture<TaskDelegationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskDelegationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDelegationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
