import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  template: `<app-nav></app-nav>
  <router-outlet></router-outlet>`
})
export class LayoutComponent{

  constructor() { }

}
