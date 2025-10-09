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
  base_experience?: number;
  order?: number;
  is_default?: boolean;
  abilities?: any[];
  moves?: any[];
  forms?: any[];
  game_indices?: any[];
  held_items?: any[];
  location_area_encounters?: string;
  species?: any;
  past_types?: any[];
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
