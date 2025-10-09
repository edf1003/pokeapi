import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Pokemon } from 'src/app/models/models-classes';
import { CapitalizePipe } from 'src/app/pipes/capitalize.pipe';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss'],
  standalone: true,
  imports: [CommonModule, CapitalizePipe],
})
export class PokemonCardComponent {
  @Input() pokemon: Pokemon;
  constructor(private router: Router) {}

  goToDetail() {
    if (!this.pokemon || !this.pokemon.id) return;
    this.router.navigate(['/pokemon', this.pokemon.id]);
  }

  //Método para obtener el tipo del Pokémon traducido
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

  //Método para obtener la abreviatura de una estadística
  getStatAbbreviation(statName: string): string {
    const statAbbreviations: { [key: string]: string } = {
      hp: 'HP',
      attack: 'ATK',
      defense: 'DEF',
      'special-attack': 'SPA',
      'special-defense': 'SPD',
      speed: 'SPE',
    };
    return statAbbreviations[statName] || statName;
  }
}
