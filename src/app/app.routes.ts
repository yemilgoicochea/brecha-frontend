import { Routes } from '@angular/router';
import { ClassifierComponent } from './features/classifier/classifier.component';
import { ResultsComponent } from './features/results/results.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'classify'
    },
    {
        path: 'classify',
        component: ClassifierComponent
    },
    {
        path: 'results',
        component: ResultsComponent
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(
            m => m.DASHBOARD_ROUTES
        )
    }
];
