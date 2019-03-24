import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BlankPageComponent} from './blank-page/blank-page.component';
import {AddComponent} from './form/add/add.component';
import {SearchComponent} from './search/search.component';
import {EditComponent} from './form/edit/edit.component';
import {RouteConfig} from '../shared/configs';
import {TripComponent} from './trip/trip.component';
import {SearchTripComponent} from './trip/search-trip/search-trip.component';
import {TripViewComponent} from './trip/trip-view/trip-view.component';
import {FinanceComponent} from './finance/finance.component';
import {TripDetailsComponent} from './trip/trip-details/trip-details.component';
import {TripGuard} from '../shared/guard';
import { DataAnalystComponent } from './data-analyst/data-analyst.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_DEFAULT),
        redirectTo: RouteConfig.deRoutify(RouteConfig.ROUTE_BLANK_PAGE),
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_BLANK_PAGE),
        component: BlankPageComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_ADD_DRIVER),
        component: AddComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_ADD_CUSTOMER),
        component: AddComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_ADD_FINANCE),
        component: AddComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_ADD_DISPATCHER),
        component: AddComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_ADD_CORPORATE),
        component: AddComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_ADD_SUPERVISOR),
        component: AddComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_ADD_DATA_ANALYST),
        component: AddComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_SEARCH_DRIVER),
        component: SearchComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_SEARCH_CUSTOMER),
        component: SearchComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_SEARCH_FINANCE),
        component: SearchComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_SEARCH_DISPATCHER),
        component: SearchComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_SEARCH_CORPORATE),
        component: SearchComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_SEARCH_SUPERVISOR),
        component: SearchComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_SEARCH_DATA_ANALYST),
        component: SearchComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_DISPATCHER_DASHBOARD),
        component: DashboardComponent,
    },
    {
        path: RouteConfig.parameterized(RouteConfig.ROUTE_EDIT_DRIVER, 'id'),
        component: EditComponent,
    },
    {
        path: RouteConfig.parameterized(RouteConfig.ROUTE_EDIT_CUSTOMER, 'id'),
        component: EditComponent,
    },
    {
        path: RouteConfig.parameterized(RouteConfig.ROUTE_EDIT_DISPATCHER, 'id'),
        component: EditComponent,
    },
    {
        path: RouteConfig.parameterized(RouteConfig.ROUTE_EDIT_CORPORATE, 'id'),
        component: EditComponent,
    },
    {
        path: RouteConfig.parameterized(RouteConfig.ROUTE_EDIT_SUPERVISOR, 'id'),
        component: EditComponent,
    },
    {
        path: RouteConfig.parameterized(RouteConfig.ROUTE_EDIT_FINANCE, 'id'),
        component: EditComponent,
    },
    {
        path: RouteConfig.parameterized(RouteConfig.ROUTE_EDIT_DATA_ANALYST, 'id'),
        component: EditComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_TRIP), component: TripComponent,
        children: [
            {
                path: 'search', component: SearchTripComponent
            },
            {
                path: ':id', component: TripDetailsComponent
            }
        ],
        canActivate: [TripGuard]
    },
    {
        path: RouteConfig.parameterized(RouteConfig.ROUTE_FINANCE, 'id'),
        component: TripViewComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_FINANCE),
        component: FinanceComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_DATA_ANALYST),
        component: DataAnalystComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_ADD_DISPATCHER_SUPERVISOR),
        component: AddComponent,
    },
    {
        path: RouteConfig.parameterized(RouteConfig.ROUTE_EDIT_DISPATCHER_SUPERVISOR, 'id'),
        component: EditComponent,
    },
    {
        path: RouteConfig.deRoutify(RouteConfig.ROUTE_SEARCH_DISPATCHER_SUPERVISOR),
        component: SearchComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [TripGuard]
})
export class ContentRoutingModule {
}
