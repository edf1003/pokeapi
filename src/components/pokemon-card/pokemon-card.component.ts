import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Pokemon } from 'src/models/models-classes';
import { CapitalizePipe } from 'src/pipes/capitalize.pipe';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss'],
  standalone: true,
  imports: [CommonModule, CapitalizePipe],
})
export class PokemonCardComponent {
  @Input() pokemon: Pokemon;
  constructor() {}

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
