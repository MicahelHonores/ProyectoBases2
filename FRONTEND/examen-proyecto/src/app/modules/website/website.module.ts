import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WebsiteRoutingModule } from './website-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { NavComponent } from './components/nav/nav.component';
import { HorariosComponent } from './pages/horarios/horarios.component';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { EstudianteComponent } from './pages/estudiante/estudiante.component';
import { NuevoExamenComponent } from './pages/nuevo-examen/nuevo-examen.component';
import { CompletarComponent } from './pages/preguntas/completar/completar.component';
import { OpcionMultipleComponent } from './pages/preguntas/opcion-multiple/opcion-multiple.component';
import { EmparejamientoComponent } from './pages/preguntas/emparejamiento/emparejamiento.component';
import { VerdaderoFalsoComponent } from './pages/preguntas/verdadero-falso/verdadero-falso.component';
import { OrdenarConceptosComponent } from './pages/preguntas/ordenar-conceptos/ordenar-conceptos.component';
import { ExamenesComponent } from './pages/examenes/examenes.component';
import { EditarExamenComponent } from './pages/editar-examen/editar-examen.component';
import { BancoPreguntasComponent } from './pages/banco-preguntas/banco-preguntas.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { AsignadosComponent } from './pages/asignados/asignados.component';
import { PresentarExamenComponent } from './pages/presentar-examen/presentar-examen.component';
import { ResolverExamenComponent } from './pages/resolver-examen/resolver-examen.component';
import { NotasComponent } from './pages/notas/notas.component';
import { HorarioEstudianteComponent } from './pages/horario-estudiante/horario-estudiante.component';
import { ContenidosComponent } from './pages/contenidos/contenidos.component';

@NgModule({
  declarations: [
    LayoutComponent,
    NavComponent,
    LoginComponent,
    HorariosComponent,
    HomeComponent,
    EstudianteComponent,
    NuevoExamenComponent,
    CompletarComponent,
    OpcionMultipleComponent,
    EmparejamientoComponent,
    VerdaderoFalsoComponent,
    OrdenarConceptosComponent,
    ExamenesComponent,
    EditarExamenComponent,
    BancoPreguntasComponent,
    ReportesComponent,
    AsignadosComponent,
    PresentarExamenComponent,
    ResolverExamenComponent,
    NotasComponent,
    HorarioEstudianteComponent,
    ContenidosComponent
  ],
  imports: [
    CommonModule,
    WebsiteRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class WebsiteModule { }
