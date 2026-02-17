import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
    authService = inject(AuthService);

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

    featuredProducts = [
        { id: 1, name: 'Casque Audio Premium', price: 199.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000' },
        { id: 2, name: 'Montre Connectée', price: 249.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000' },
        { id: 3, name: 'Caméra Pro', price: 899.99, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=1000' },
        { id: 4, name: 'Tennis Running', price: 129.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000' },
    ];

    testimonials = [
        { name: 'Sophie M.', comment: 'Service client exceptionnel et produits de qualité !', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
        { name: 'Thomas L.', comment: 'La livraison a été super rapide. Je recommande vivement.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        { name: 'Marie D.', comment: 'Une expérience d\'achat fluide du début à la fin.', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d' },
    ];

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
