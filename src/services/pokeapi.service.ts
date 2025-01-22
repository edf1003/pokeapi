import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PokeApiRsp, Pokemon } from '../models/models-classes';

@Injectable({
  providedIn: 'root',
})
export class PokeApiService {
  private pokemonsCache: Map<number, Pokemon> = new Map();

  constructor(private http: HttpClient) {}

  private getBaseUrl(): string {
    return 'https://pokeapi.co/api/v2/';
  }

  getPokemonsPaginated(skip: number, take: number): Promise<Pokemon[]> {
    return new Promise((resolve, reject) => {
      this.http
        .get<PokeApiRsp>(
          `${this.getBaseUrl()}pokemon/?offset=${skip}&limit=${take}`
        )
        .subscribe({
          next: (rsp) => {
            const pokemonRequests = rsp.results.map((p) =>
              this.http.get<Pokemon>(p.url).toPromise()
            );

            // Espera a que todas las peticiones de Pokémon terminen
            Promise.all(pokemonRequests)
              .then((pokemons) => {
                pokemons.forEach((pokemon) =>
                  this.pokemonsCache.set(pokemon.id, pokemon)
                );
                resolve(Array.from(this.pokemonsCache.values()));
              })
              .catch((error) => reject(error));
          },
          error: (err) => reject(err),
        });
    });
  }
}
