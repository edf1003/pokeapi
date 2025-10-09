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
  getAllPokemons(forceReload: boolean = false): Observable<Pokemon[]> {
    // Si ya tenemos cache y no se fuerza la recarga, devolvemos el cache
    if (!forceReload && this.pokemonsCache && this.pokemonsCache.length > 0) {
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

  // Obtener el Pokémon base si el actual es una variante
  getBasePokemon(pokemon: Pokemon): Observable<Pokemon | null> {
    if (!pokemon.species?.url) return of(null);
    
    return this.http.get<any>(pokemon.species.url).pipe(
      switchMap(species => {
        const defaultForm = species.varieties?.find((v: any) => v.is_default)?.pokemon?.url;
        if (!defaultForm) return of(null);
        return this.http.get<Pokemon>(defaultForm);
      }),
      catchError(() => of(null))
    );
  }

  // Obtener evoluciones dado el id de un pokemon
  // Devuelve un Observable con el array de Pokemon (detalles básicos)
  getPokemonVariants(id: number): Observable<Pokemon[]> {
    return this.getPokemonById(id).pipe(
      switchMap((pokemon) => {
        // Obtener formas alternativas del Pokémon
        const formPromises: Observable<Pokemon>[] = (pokemon.forms || [])
          .filter(
            (form) => form.url !== `${this.getBaseUrl()}pokemon-form/${id}/`
          )
          .map((form) => this.http.get<Pokemon>(form.url));

        // Obtener la especie para mega evoluciones y formas regionales
        const speciesUrl =
          pokemon.species?.url || `${this.getBaseUrl()}pokemon-species/${id}/`;
        const speciesRequest = this.http.get<any>(speciesUrl).pipe(
          switchMap((species) => {
            const variantPromises = (species.varieties || [])
              .filter(
                (v) => v.pokemon.url !== `${this.getBaseUrl()}pokemon/${id}/`
              )
              .map((v) => this.http.get<Pokemon>(v.pokemon.url));
            return variantPromises.length 
              ? forkJoin(variantPromises)
              : of([] as Pokemon[]);
          })
        );

        // Si hay formas, combinarlas
        const formsObs = formPromises.length
          ? forkJoin(formPromises)
          : of([] as Pokemon[]);

        return forkJoin({
          forms: formsObs as Observable<Pokemon[]>,
          varieties: speciesRequest as Observable<Pokemon[]>,
        }).pipe(
          map(({ forms, varieties }) => [...(forms || []), ...(varieties || [])]),
          catchError(() => of([]))
        );
      })
    );
  }

  getEvolutionsForPokemon(id: number): Observable<Pokemon[]> {
    // Primero obtener el pokemon (para acceder a species.url)
    return this.getPokemonById(id).pipe(
      switchMap((pokemon) => {
        const speciesUrl =
          (pokemon.species && pokemon.species.url) ||
          `${this.getBaseUrl()}pokemon-species/${id}/`;
        return this.http.get<any>(speciesUrl).pipe(
          switchMap((speciesRsp) => {
            const evoUrl = speciesRsp.evolution_chain?.url;
            if (!evoUrl) return of([]);
            return this.http.get<any>(evoUrl).pipe(
              map((chainRsp) => {
                // parsear cadena recursiva para obtener nombres
                const names: string[] = [];
                function traverse(node: any) {
                  if (!node) return;
                  if (node.species && node.species.name)
                    names.push(node.species.name);
                  if (node.evolves_to && node.evolves_to.length) {
                    node.evolves_to.forEach((c: any) => traverse(c));
                  }
                }
                traverse(chainRsp.chain);
                return names;
              }),
              switchMap((names: string[]) => {
                if (!names || names.length === 0) return of([]);
                // convertir cada nombre en petición para obtener su Pokemon
                const requests = names.map((n) =>
                  this.http.get<Pokemon>(`${this.getBaseUrl()}pokemon/${n}`)
                );
                return forkJoin(requests).pipe(
                  catchError((err) => {
                    console.error('Error fetching evolution pokemons', err);
                    return of([]);
                  })
                );
              })
            );
          })
        );
      })
    );
  }
}
