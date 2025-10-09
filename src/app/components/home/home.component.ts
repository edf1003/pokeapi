import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { PokeApiService } from '../../services/pokeapi.service';
import { PaginatedParams, Pokemon } from '../../models/models-classes';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    PokemonCardComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  loading = true;
  pokemonsPaginated: Pokemon[] = [];

  tableParams: PaginatedParams = {
    currentPage: 0,
    PAGE_SIZE: 15,
  };

  dataForm = this.formbuilder.group({
    name: [undefined as string],
  });

  private subscription: Subscription = new Subscription();

  constructor(
    private pokeApiService: PokeApiService,
    private formbuilder: FormBuilder,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Suscribirse a la carga de todos los pokemons y poblar la vista
    const subAll = this.pokeApiService.getAllPokemons().subscribe({
      next: () => {
        this.searchPokemon();
      },
      error: (e) => {
        console.error('Error loading all pokemons in home', e);
      },
    });
    this.subscription.add(subAll);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  searchPokemon(restarPagination = false) {
    this.loading = true;
    this.ngZone.run(() => {
      try {
        if (restarPagination) {
          this.tableParams.currentPage = 0;
        }
        this.pokemonsPaginated = this.pokeApiService.getPokemonsPaginated(
          this.tableParams.currentPage * this.tableParams.PAGE_SIZE,
          this.tableParams.PAGE_SIZE,
          this.dataForm.controls.name.value
        );
      } catch (error) {
        console.error('Error fetching pokemons:', error);
      } finally {
        this.loading = false;
      }
    });
  }

  previousPage() {
    if (!this.canGoBack()) return;
    setTimeout(() => {
      this.tableParams.currentPage--;
      this.searchPokemon();
    }, 500);
  }

  canGoBack() {
    return this.tableParams.currentPage > 0;
  }

  nextPage() {
    if (!this.canGoNext()) return;
    setTimeout(() => {
      this.tableParams.currentPage++;
      this.searchPokemon();
    }, 500);
  }

  canGoNext() {
    return (
      this.tableParams.currentPage <
      this.pokeApiService.totalPokemons / this.tableParams.PAGE_SIZE - 1
    );
  }

  getPaginationText() {
    return (
      this.tableParams.currentPage +
      1 +
      ' de ' +
      (
        Math.floor(
          this.pokeApiService.totalPokemons / this.tableParams.PAGE_SIZE
        ) + 1
      ).toFixed(0)
    );
  }
}
