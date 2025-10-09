import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
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

  // Método para cargar todos los Pokémon (ahora devuelve Observable)
  getAllPokemons(): Observable<Pokemon[]> {
    // Si ya tenemos cache, devolvemos el cache y no recargamos
    if (this.pokemonsCache && this.pokemonsCache.length > 0) {
      // asegurar que el subject indique que ya cargó
      this.hasLoadAllPokemons$.next(true);
      return of(this.pokemonsCache);
    }

    const url = `${this.getBaseUrl()}pokemon/?offset=${0}&limit=${100000}`;

    return this.http.get<PokeApiRsp>(url).pipe(
      switchMap((rsp) => {
        const requests = rsp.results.map((p) => this.http.get<Pokemon>(p.url));
        return forkJoin(requests).pipe(
          map((pokemonResults) => ({ pokemonResults, count: rsp.count }))
        );
      }),
      tap(({ pokemonResults, count }) => {
        // Reemplazamos el cache en lugar de push para evitar duplicados
        this.pokemonsCache = [...pokemonResults];
        this.totalPokemons = count;
        this.pokemonsCache.sort((a, b) => a.id - b.id);
        this.hasLoadAllPokemons$.next(true); // Notificamos que todos los Pokémon han sido cargados
      }),
      map(({ pokemonResults }) => pokemonResults),
      catchError((error) => {
        console.error('Error loading pokemons:', error);
        this.hasLoadAllPokemons$.next(false);
        return throwError(() => error);
      })
    );
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

  // Obtener Pokemon por id, primero intento de cache, luego fetch a la API
  getPokemonById(id: number): Observable<Pokemon> {
    const found = this.pokemonsCache.find((p) => p.id === id);
    if (found) return of(found);

    return this.http.get<Pokemon>(`${this.getBaseUrl()}pokemon/${id}/`).pipe(
      tap((pokemon) => {
        // cachear el pokemon recibido (evitar duplicados)
        const exists = this.pokemonsCache.find((p) => p.id === pokemon.id);
        if (!exists) {
          this.pokemonsCache.push(pokemon);
          this.pokemonsCache.sort((a, b) => a.id - b.id);
        }
      }),
      catchError((error) => {
        console.error('Error fetching pokemon by id', error);
        return throwError(() => error);
      })
    );
  }
}
