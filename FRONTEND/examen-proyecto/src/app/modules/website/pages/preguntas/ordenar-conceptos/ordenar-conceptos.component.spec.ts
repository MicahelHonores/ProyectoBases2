import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenarConceptosComponent } from './ordenar-conceptos.component';

describe('OrdenarConceptosComponent', () => {
  let component: OrdenarConceptosComponent;
  let fixture: ComponentFixture<OrdenarConceptosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdenarConceptosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenarConceptosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
