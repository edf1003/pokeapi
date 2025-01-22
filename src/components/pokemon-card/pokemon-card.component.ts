import { Component, Input } from '@angular/core';
import { Pokemon } from 'src/models/models-classes';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss'],
  standalone: true,
})
export class PokemonCardComponent {
  @Input() pokemon: Pokemon;
  constructor() {}
}
