import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './pages/home/home.component';
import { HorariosComponent } from './pages/horarios/horarios.component';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ProfessorGuard } from 'src/app/guards/professor.guard'; // Importa el nuevo guardia
import { EstudianteComponent } from './pages/estudiante/estudiante.component';
import { StudentGuard } from 'src/app/guards/student.guard';
import { LoginGuard } from 'src/app/guards/login-guard.guard';
import { NuevoExamenComponent } from './pages/nuevo-examen/nuevo-examen.component';
import { ActivatedRoute } from '@angular/router';
import { ExamenesComponent } from './pages/examenes/examenes.component';
import { EditarExamenComponent } from './pages/editar-examen/editar-examen.component';
import { BancoPreguntasComponent } from './pages/banco-preguntas/banco-preguntas.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { PresentarExamenComponent } from './pages/presentar-examen/presentar-examen.component';
import { AsignadosComponent } from './pages/asignados/asignados.component';
import { NotasComponent } from './pages/notas/notas.component';
import { HorarioEstudianteComponent } from './pages/horario-estudiante/horario-estudiante.component';
import { ContenidosComponent } from './pages/contenidos/contenidos.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [ProfessorGuard]
      },
      {
        path: 'new-exam/:id',
        component: NuevoExamenComponent,
        canActivate: [ProfessorGuard]
      },
      {
        path: 'editar-examen/:id',
        component: EditarExamenComponent,
        canActivate: [ProfessorGuard]
      },
      {
        path: 'horarios',
        component: HorariosComponent,
        canActivate: [ProfessorGuard]
      },
      {
        path: 'examenes',
        component: ExamenesComponent,
        canActivate: [ProfessorGuard]
      },
      {
        path: 'banco-preguntas',
        component: BancoPreguntasComponent,
        canActivate: [ProfessorGuard]
      },
      {
        path: 'reportes',
        component: ReportesComponent,
        canActivate: [ProfessorGuard]
      },
      {
        path: 'estudiante',
        component: EstudianteComponent,
        canActivate: [StudentGuard]
      },
      {
        path: 'asignados',
        component: AsignadosComponent,
        canActivate: [StudentGuard]
      },

      {
        path: 'presentar-examen/:id',
        component: PresentarExamenComponent,
        canActivate: [StudentGuard]
      },
      {
        path: 'notas',
        component: NotasComponent,
        canActivate: [StudentGuard]
      },
      {
        path: 'mi-horario',
        component: HorarioEstudianteComponent,
        canActivate: [StudentGuard]
      },
      {
        path: 'contenidos',
        component: ContenidosComponent,
        canActivate: [StudentGuard]
      }
      // Agregar más rutas según sea necesario
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebsiteRoutingModule { }
