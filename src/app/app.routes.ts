import { Routes } from '@angular/router';
import { ClassifierPageComponent } from './features/classifier/classifier-page.component';
import { HistoryComponent } from './features/classifier/history.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'classify',
        component: ClassifierPageComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'history',
        component: HistoryComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(
            m => m.DASHBOARD_ROUTES
        )
    }
];
