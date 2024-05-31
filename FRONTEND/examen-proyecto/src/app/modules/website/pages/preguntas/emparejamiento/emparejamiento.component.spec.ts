import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmparejamientoComponent } from './emparejamiento.component';

describe('EmparejamientoComponent', () => {
  let component: EmparejamientoComponent;
  let fixture: ComponentFixture<EmparejamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmparejamientoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmparejamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
