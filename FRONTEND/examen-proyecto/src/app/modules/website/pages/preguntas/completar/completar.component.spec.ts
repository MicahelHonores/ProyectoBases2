import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletarComponent } from './completar.component';

describe('CompletarComponent', () => {
  let component: CompletarComponent;
  let fixture: ComponentFixture<CompletarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompletarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
