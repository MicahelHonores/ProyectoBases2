import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignadosComponent } from './asignados.component';

describe('AsignadosComponent', () => {
  let component: AsignadosComponent;
  let fixture: ComponentFixture<AsignadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
