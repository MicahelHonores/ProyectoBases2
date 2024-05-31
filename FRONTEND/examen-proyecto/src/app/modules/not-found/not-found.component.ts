import { ThemePalette,ThemeService } from './../../services/theme.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {
  lightThemeImage: string = '../../../assets/images/BELTXIMSOFT.png';
  darkThemeImage: string = '../../../assets/images/BELTXIMSOFT2.png';
  isDarkTheme: boolean = false;

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.themeService.theme.subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });
  }
}
