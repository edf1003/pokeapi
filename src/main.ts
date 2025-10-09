import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './app/components/home/home.component';
import { PokemonDetailComponent } from './app/components/pokemon-detail/pokemon-detail.component';

const routes = [
  { path: '', component: HomeComponent },
  { path: 'pokemon/:id', component: PokemonDetailComponent },
];

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(HttpClientModule), provideRouter(routes)],
});
