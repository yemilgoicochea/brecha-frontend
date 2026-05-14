import { Routes } from '@angular/router';
import { ClassifierPageComponent } from './features/classifier/classifier-page.component';
import { HistoryComponent } from './features/classifier/history.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { SectorsComponent } from './features/admin/sectors/sectors.component';
import { GapsComponent } from './features/admin/gaps/gaps.component';

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
    },
    {
        path: 'admin',
        canActivate: [AuthGuard, AdminGuard],
        children: [
            { path: 'sectors', component: SectorsComponent },
            { path: 'gaps', component: GapsComponent },
            { path: '', redirectTo: 'sectors', pathMatch: 'full' },
        ]
    }
];
