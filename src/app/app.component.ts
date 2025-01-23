import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PokeApiService } from '../services/pokeapi.service';
import { PaginatedParams, Pokemon } from '../models/models-classes';
import { HttpClientModule } from '@angular/common/http';
import { PokemonCardComponent } from 'src/components/pokemon-card/pokemon-card.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, PokemonCardComponent],
})
export class AppComponent implements OnInit {
  tableParams: PaginatedParams = {
    currentPage: 0,
    PAGE_SIZE: 20,
  };
  loading = false;
  pokemons: Pokemon[] = [];

  constructor(private pokeApiService: PokeApiService) {}

  ngOnInit(): void {
    this.loadPokemons(
      this.tableParams.currentPage * this.tableParams.PAGE_SIZE,
      this.tableParams.PAGE_SIZE
    );
  }

  loadPokemons(skip: number, take: number): void {
    this.loading = true;
    this.pokeApiService
      .getPokemonsPaginated(skip, take)
      .then((pokemons) => {
        this.pokemons = pokemons;
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error loading pokemons:', error);
        this.loading = false;
      });
  }
}
