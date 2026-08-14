import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestApproval } from './request-approval';

describe('RequestApproval', () => {
  let component: RequestApproval;
  let fixture: ComponentFixture<RequestApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestApproval],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
