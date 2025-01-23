import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PokeApiService } from '../services/pokeapi.service';
import { PaginatedParams, Pokemon } from '../models/models-classes';
import { PokemonCardComponent } from 'src/components/pokemon-card/pokemon-card.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    PokemonCardComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class AppComponent implements OnInit {
  tableParams: PaginatedParams = {
    currentPage: 0,
    PAGE_SIZE: 15,
  };
  loading = false;

  pokemonsCache: Pokemon[] = [];

  dataForm = this.formbuilder.group({
    name: [undefined as string],
  });

  constructor(
    public pokeApiService: PokeApiService,
    private formbuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadPokemons();
  }

  loadPokemons() {
    this.pokeApiService
      .getPokemonsPaginated(
        this.tableParams.currentPage * this.tableParams.PAGE_SIZE,
        this.tableParams.PAGE_SIZE
      )
      .then((pokemons) => {
        this.pokemonsCache = pokemons;
      })
      .catch((error) => {
        console.error('Error loading pokemons:', error);
      });
  }

  searchPokemon() {
    if (!this.dataForm.controls.name.value) {
      this.loadPokemons();
    } else {
      this.pokemonsCache = this.pokemonsCache.filter((p) =>
        p.name.includes(this.dataForm.controls.name.value)
      );
    }
  }

  previousPage() {
    if (!this.canGoBack()) return;
    this.pokemonsCache = [];
    setTimeout(() => {
      this.tableParams.currentPage--;
      this.loadPokemons();
    }, 500);
  }

  nextPage() {
    if (!this.canGoNext()) return;
    this.pokemonsCache = [];
    setTimeout(() => {
      this.tableParams.currentPage++;
      this.loadPokemons();
    }, 500);
  }

  getPaginationText() {
    return (
      this.tableParams.currentPage +
      1 +
      ' - ' +
      (
        this.pokeApiService.totalPokemons / this.tableParams.PAGE_SIZE -
        1
      ).toFixed(0)
    );
  }

  canGoBack() {
    return this.tableParams.currentPage > 0;
  }

  canGoNext() {
    return (
      this.tableParams.currentPage <
      this.pokeApiService.totalPokemons / this.tableParams.PAGE_SIZE - 1
    );
  }
}
