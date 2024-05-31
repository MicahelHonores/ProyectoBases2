import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BancoPreguntasComponent } from './banco-preguntas.component';

describe('BancoPreguntasComponent', () => {
  let component: BancoPreguntasComponent;
  let fixture: ComponentFixture<BancoPreguntasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BancoPreguntasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BancoPreguntasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
