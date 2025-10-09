import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { PokeApiService } from '../../services/pokeapi.service';
import { Pokemon } from '../../models/models-classes';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, CapitalizePipe],
})
export class PokemonDetailComponent implements OnInit, OnDestroy {
  // Variables de clase
  pokemon: Pokemon | null = null;
  loading = true;
  evolutions: Pokemon[] = [];
  private sub: Subscription | null = null;
  private subEvo: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private pokeApi: PokeApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (!id || isNaN(id)) {
        console.warn('Invalid id param for pokemon detail:', params['id']);
        this.loading = false;
        return;
      }
      this.loadPokemonData(id);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.subEvo?.unsubscribe();
  }

  goHome() {
    this.pokeApi.getAllPokemons().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (e) => {
        console.error('Error loading pokemons before navigation:', e);
        this.router.navigate(['/']);
      },
    });
  }

  goToPokemon(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.loading) return;

    this.loading = true;
    this.router.navigate(['/pokemon', id]);
  }

  loadPokemonData(id: number) {
    this.loading = true;
    this.sub?.unsubscribe();
    this.subEvo?.unsubscribe();

    this.sub = this.pokeApi.getPokemonById(id).subscribe({
      next: (p) => {
        this.pokemon = p;
        this.loading = false;
        this.subEvo = this.pokeApi.getEvolutionsForPokemon(p.id).subscribe({
          next: (evs) => {
            this.evolutions = evs.filter((x) => x && x.id !== p.id);
          },
          error: (e) => {
            console.error('Error loading evolutions', e);
          },
        });
      },
      error: (e) => {
        console.error('Error loading pokemon detail', e);
        this.loading = false;
      },
    });
  }

  getTypeGradient(types: { type: { name: string } }[] | undefined) {
    if (!types || types.length === 0) return {};

    const typeColors: Record<string, string> = {
      normal: '#d3d3d380',
      fire: '#ff450080',
      water: '#00bfff80',
      grass: '#32cd3280',
      electric: '#ffd70080',
      ice: '#add8e680',
      fighting: '#8b451380',
      poison: '#9400d380',
      ground: '#d2b48c80',
      flying: '#87cefa80',
      psychic: '#ff69b480',
      bug: '#9acd3280',
      rock: '#a0522d80',
      ghost: '#4b008280',
      dragon: '#483d8b80',
      dark: '#2f4f4f80',
      steel: '#a9a9a980',
      fairy: '#ffb6c180',
    };

    const colors = types.map((t) => typeColors[t.type.name] || '#cccccc80');
    return {
      background:
        colors.length > 1
          ? `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`
          : colors[0],
    };
  }

  getStatIcon(statName: string): string {
    const icons: Record<string, string> = {
      hp: 'fa-heart',
      attack: 'fa-hand-fist',
      defense: 'fa-shield-halved',
      'special-attack': 'fa-wand-sparkles',
      'special-defense': 'fa-shield-heart',
      speed: 'fa-bolt',
    };
    return icons[statName.toLowerCase()] || 'fa-star';
  }

  getStatDescription(statName: string): string {
    const descriptions: Record<string, string> = {
      hp: "Hit Points - The Pokémon's health",
      attack: 'Attack - Physical attack strength',
      defense: 'Defense - Physical defensive strength',
      'special-attack': 'Special Attack - Special attack power',
      'special-defense': 'Special Defense - Special defensive capability',
      speed: 'Speed - Determines who attacks first',
    };
    return descriptions[statName.toLowerCase()] || statName;
  }

  translateType(type: string): string {
    const translations: { [key: string]: string } = {
      fire: 'Fuego',
      water: 'Agua',
      grass: 'Planta',
      electric: 'Eléctrico',
      psychic: 'Psíquico',
      ice: 'Hielo',
      dragon: 'Dragón',
      dark: 'Siniestro',
      fairy: 'Hada',
      normal: 'Normal',
      fighting: 'Lucha',
      flying: 'Volador',
      poison: 'Veneno',
      ground: 'Tierra',
      rock: 'Roca',
      bug: 'Bicho',
      ghost: 'Fantasma',
      steel: 'Acero',
    };
    return translations[type.toLowerCase()] || type;
  }
}
