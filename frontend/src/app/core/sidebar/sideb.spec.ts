import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sideb } from './sideb';

describe('Sideb', () => {
  let component: Sideb;
  let fixture: ComponentFixture<Sideb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sideb],
    }).compileComponents();

    fixture = TestBed.createComponent(Sideb);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
