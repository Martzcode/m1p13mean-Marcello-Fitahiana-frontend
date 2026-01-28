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
    features = [
        { title: 'Angular 18', desc: 'Latest version with standalone components.', Icon: '🚀' },
        { title: 'TypeScript', desc: 'Strongly typed for scalable applications.', Icon: '🛡️' },
        { title: 'Express.js API', desc: 'Ready to connect to your backend service.', Icon: '🔌' },
        { title: 'Premium UI', desc: 'Modern glassmorphism design system.', Icon: '✨' }
    ];
}
