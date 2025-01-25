import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PokeApiRsp, Pokemon } from '../models/models-classes';

@Injectable({
  providedIn: 'root',
})
export class PokeApiService {
  totalPokemons: number = 0;
  pokemonsCache: Pokemon[] = [];
  hasLoadAllPokemons$ = new BehaviorSubject<boolean>(false); // BehaviorSubject para notificar cuando se han cargado todos los Pokémon

  constructor(private http: HttpClient) {}

  //Método para obtener la URL base de la API
  private getBaseUrl(): string {
    return 'https://pokeapi.co/api/v2/';
  }

  //Métoco para cargar todos los Pokémon
  async getAllPokemons() {
    try {
      const rsp = await this.http
        .get<PokeApiRsp>(
          `${this.getBaseUrl()}pokemon/?offset=${0}&limit=${100000}`
        )
        .toPromise();

      const requests = rsp.results.map((p) =>
        this.http.get<Pokemon>(p.url).toPromise()
      );

      const pokemonResults = await Promise.all(requests);

      this.pokemonsCache.push(...pokemonResults);
      this.totalPokemons = rsp.count;
      this.pokemonsCache.sort((a, b) => a.id - b.id);
    } catch (error) {
      console.error('Error loading pokemons:', error);
    } finally {
      this.hasLoadAllPokemons$.next(true); // Notificamos que todos los Pokémon han sido cargados
    }
  }

  //Método para obtener los Pokémon paginados de memoria
  getPokemonsPaginated(skip: number, take: number, name?: string): Pokemon[] {
    if (name) {
      var pokemons = this.pokemonsCache.filter((p) => p.name.includes(name));
      this.totalPokemons = pokemons.length;
      return pokemons.slice(skip, skip + take);
    }
    this.totalPokemons = this.pokemonsCache.length;
    return this.pokemonsCache.slice(skip, skip + take);
  }
}
