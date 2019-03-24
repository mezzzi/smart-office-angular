import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guard';
import { LoginComponent } from './login/login.component';
import { RouteConfig } from './shared/configs/route.config';

const routes: Routes = [
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_DEFAULT),
        loadChildren: './layout/layout.module#LayoutModule',
        canActivate: [AuthGuard]
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_LOG_IN),
        component: LoginComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [AuthGuard]
})
export class AppRoutingModule { }
