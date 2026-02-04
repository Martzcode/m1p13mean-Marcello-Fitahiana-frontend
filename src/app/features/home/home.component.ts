import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
    heroSlides = [
        {
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
            title: 'NOUVELLE COLLECTION',
            subtitle: 'Découvrez les tendances printemps-été'
        },
        {
            image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2070&auto=format&fit=crop',
            title: 'ÉVÉNEMENT EXCLUSIF',
            subtitle: 'Rencontrez vos créateurs préférés ce weekend'
        },
        {
            image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070&auto=format&fit=crop',
            title: 'VOTRE CENTRE SHOPPING',
            subtitle: 'Ouvert tous les jours de 10h à 20h'
        }
    ];

    shops = [
        { name: 'ZARA', category: 'Mode', image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=500&auto=format&fit=crop' },
        { name: 'H&M', category: 'Mode', image: 'https://images.unsplash.com/photo-1551488852-c2e26c6d0cb3?q=80&w=500&auto=format&fit=crop' },
        { name: 'FNAC', category: 'Culture', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=500&auto=format&fit=crop' },
        { name: 'SEPHORA', category: 'Beauté', image: 'https://images.unsplash.com/photo-1616781432733-dc194d214a1e?q=80&w=500&auto=format&fit=crop' }
    ];

    restaurants = [
        { name: 'VAPIANO', cuisine: 'Italien', image: 'https://images.unsplash.com/photo-1616641829377-1f486a2cc6c7?q=80&w=500&auto=format&fit=crop' },
        { name: 'FIVE GUYS', cuisine: 'Burger', image: 'https://images.unsplash.com/photo-1623293848600-b6f17d3d240d?q=80&w=500&auto=format&fit=crop' },
        { name: 'PRET A MANGER', cuisine: 'Sandwich', image: 'https://images.unsplash.com/photo-1605342730303-34e2c906c7d5?q=80&w=500&auto=format&fit=crop' }
    ];

    news = [
        {
            category: 'OFFRE',
            title: 'Soldes d\'hiver',
            date: 'Jusqu\'au 20 Février',
            image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=800&auto=format&fit=crop'
        },
        {
            category: 'ÉVÉNEMENT',
            title: 'Concert Live',
            date: 'Samedi 15 Février',
            image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop'
        }
    ];
}
