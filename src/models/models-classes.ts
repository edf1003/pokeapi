export class PaginatedParams {
  currentPage: number = 0;
  readonly PAGE_SIZE = 20;
}

export class PokeApiRsp {
  count: number;
  next: string;
  previous: string;
  results: NamedAPIResource[];
}

export class Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  weight: number;
  height: number;
  stats: PokemonStat[];
}

export class PokemonType {
  slot: number;
  type: NamedAPIResource;
}

export class PokemonStat {
  baseStat: number;
  effort: number;
  name: NamedAPIResource;
}

export class NamedAPIResource {
  name: string;
  url: string;
}
