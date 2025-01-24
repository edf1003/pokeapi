export class PaginatedParams {
  currentPage: number = 0;
  PAGE_SIZE = 10;
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
  sprites: PokemonSprite;
}

export class PokemonType {
  slot: number;
  type: NamedAPIResource;
}

export class PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export class PokemonSprite {
  back_default: string;
  back_female: string;
  back_shiny: string;
  back_shiny_female: string;
  front_default: string;
  front_female: string;
  front_shiny: string;
  front_shiny_female: string;
}

export class NamedAPIResource {
  name: string;
  url: string;
}
