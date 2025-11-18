import { Routes } from '@angular/router';
import { ClassifierPageComponent } from './features/classifier/classifier-page.component';
import { HistoryComponent } from './features/classifier/history.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'classify'
    },
    {
        path: 'classify',
        component: ClassifierPageComponent
    },
    {
        path: 'history',
        component: HistoryComponent
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(
            m => m.DASHBOARD_ROUTES
        )
    }
];
