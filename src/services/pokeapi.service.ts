import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PokeApiRsp, Pokemon } from '../models/models-classes';

@Injectable({
  providedIn: 'root',
})
export class PokeApiService {
  totalPokemons: number = 0;
  constructor(private http: HttpClient) {}

  private getBaseUrl(): string {
    return 'https://pokeapi.co/api/v2/';
  }

  getPokemonsPaginated(skip: number, take: number): Promise<Pokemon[]> {
    return new Promise((resolve, reject) => {
      const pokemons: Pokemon[] = [];
      this.http
        .get<PokeApiRsp>(
          `${this.getBaseUrl()}pokemon/?offset=${skip}&limit=${take}`
        )
        .subscribe({
          next: (rsp) => {
            const requests = rsp.results.map((p) =>
              this.http.get<Pokemon>(p.url).toPromise()
            );

            Promise.all(requests)
              .then((pokemonResults) => {
                pokemons.push(...pokemonResults);
                this.totalPokemons = rsp.count;
                resolve(pokemons.sort((a, b) => a.id - b.id));
              })
              .catch((error) => {
                reject(error);
              });
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }
}
