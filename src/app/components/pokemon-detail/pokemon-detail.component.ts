import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PokeApiService } from '../../services/pokeapi.service';
import { Pokemon } from '../../models/models-classes';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class PokemonDetailComponent implements OnInit, OnDestroy {
  pokemon: Pokemon | null = null;
  loading = true;
  private sub: Subscription | null = null;

  constructor(private route: ActivatedRoute, private pokeApi: PokeApiService) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!id || isNaN(id)) {
      console.warn('Invalid id param for pokemon detail:', idParam);
      this.loading = false;
      return;
    }
    this.loading = true;
    this.sub = this.pokeApi.getPokemonById(id).subscribe({
      next: (p) => {
        this.pokemon = p;
        this.loading = false;
      },
      error: (e) => {
        console.error('Error loading pokemon detail', e);
        this.loading = false;
      },
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
