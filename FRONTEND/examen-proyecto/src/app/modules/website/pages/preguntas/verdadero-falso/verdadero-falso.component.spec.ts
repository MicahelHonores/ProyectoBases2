import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerdaderoFalsoComponent } from './verdadero-falso.component';

describe('VerdaderoFalsoComponent', () => {
  let component: VerdaderoFalsoComponent;
  let fixture: ComponentFixture<VerdaderoFalsoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerdaderoFalsoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerdaderoFalsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
