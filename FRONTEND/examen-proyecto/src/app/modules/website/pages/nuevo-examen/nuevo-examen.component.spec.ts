import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoExamenComponent } from './nuevo-examen.component';

describe('NuevoExamenComponent', () => {
  let component: NuevoExamenComponent;
  let fixture: ComponentFixture<NuevoExamenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NuevoExamenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoExamenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
