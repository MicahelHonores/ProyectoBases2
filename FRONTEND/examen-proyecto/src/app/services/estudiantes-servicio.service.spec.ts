import { TestBed } from '@angular/core/testing';

import { EstudiantesServicioService } from './estudiantes-servicio.service';

describe('EstudiantesServicioService', () => {
  let service: EstudiantesServicioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstudiantesServicioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
