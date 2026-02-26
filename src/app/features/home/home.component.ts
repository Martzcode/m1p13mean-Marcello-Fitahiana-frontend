import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProduitService } from '../../core/services/produit.service';
import { CentreService } from '../../core/services/centre.service';
import { DEFAULT_PRODUCT_IMAGE } from '../../core/constants/app.constants';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
    authService = inject(AuthService);
    private produitService = inject(ProduitService);
    private centreService = inject(CentreService);

    centre: any = null;

    categories = [
        { id: 1, name: 'Électronique', image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&q=80&w=2070' },
        { id: 2, name: 'Mode', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2070' },
        { id: 3, name: 'Maison', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=2074' },
        { id: 4, name: 'Beauté', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=2000' },
        { id: 5, name: 'Sport', image: 'https://images.unsplash.com/photo-1461896756970-42173167bde4?auto=format&fit=crop&q=80&w=2000' },
        { id: 6, name: 'Jouets', image: 'https://images.unsplash.com/photo-1531651008558-ed1740375b39?auto=format&fit=crop&q=80&w=2000' },
        { id: 7, name: 'Bijoux', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000' },
        { id: 8, name: 'Livres', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=2000' },
    ];

    featuredProducts: any[] = [];

    testimonials = [
        { name: 'Sophie M.', comment: 'Service client exceptionnel et produits de qualité !', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
        { name: 'Thomas L.', comment: 'La livraison a été super rapide. Je recommande vivement.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        { name: 'Marie D.', comment: 'Une expérience d\'achat fluide du début à la fin.', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d' },
    ];

    jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    joursLabels: Record<string, string> = {
        lundi: 'Lundi', mardi: 'Mardi', mercredi: 'Mercredi', jeudi: 'Jeudi',
        vendredi: 'Vendredi', samedi: 'Samedi', dimanche: 'Dimanche'
    };

    ngOnInit(): void {
        this.loadCentreInfo();
        this.loadFeaturedProducts();
    }

    loadCentreInfo(): void {
        this.centreService.getCentre().subscribe({
            next: (response: any) => {
                this.centre = response.data || response;
            },
            error: () => {}
        });
    }

    getTodayKey(): string {
        const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        return days[new Date().getDay()];
    }

    loadFeaturedProducts(): void {
        this.produitService.getProduits({ actif: true }).subscribe({
            next: (response: any) => {
                const produits = response.data || response || [];
                this.featuredProducts = produits
                    .filter((p: any) => p.stock > 0)
                    .slice(0, 4)
                    .map((p: any) => ({
                        id: p._id,
                        name: p.nom,
                        price: p.prix,
                        image: p.images?.[0] || DEFAULT_PRODUCT_IMAGE
                    }));
            },
            error: () => {
                this.featuredProducts = [];
            }
        });
    }

    formatPrix(prix: number): string {
        return new Intl.NumberFormat('fr-FR').format(prix) + ' Ar';
    }

    onImageError(event: Event): void {
        (event.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
    }

    scrollCategories(direction: 'left' | 'right') {
        const container = document.getElementById('categories-container');
        if (container) {
            const scrollAmount = 400;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    }
}
