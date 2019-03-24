import { CommonModule } from '@angular/common';
import { NgModule, Component } from '@angular/core';
import {
    MatGridListModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatSortModule,
    MatExpansionModule,
    MatChipsModule
} from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { ContentRoutingModule } from './content-routing.module';
import { BlankPageComponent } from './blank-page/blank-page.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddComponent } from './form/add/add.component';
import { SearchComponent } from './search/search.component';
import { EditComponent } from './form/edit/edit.component';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { NotifyPendingTripComponent, TripComponent } from './trip/trip.component';
import { CancelTripComponent, RideComponent } from './ride/ride.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MapComponent } from './map/map.component';
import { AgmCoreModule } from '@agm/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ContentComponent } from './content.component';
import { SearchTripComponent } from './trip/search-trip/search-trip.component';
import { MatSlideToggleModule } from '@angular/material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { TripViewComponent } from './trip/trip-view/trip-view.component';
import { FinanceComponent } from './finance/finance.component';
import { TripDetailsComponent } from './trip/trip-details/trip-details.component';
import { DataAnalystComponent } from './data-analyst/data-analyst.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NbThemeModule, NbLayoutModule, NbCardModule } from '@nebular/theme';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartModule } from 'angular2-chartjs';
import { DispatcherComponent } from './dispatcher/dispatcher.component';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DisputeComponent } from './dispute/dispute.component';
import { StarRatingModule } from 'angular-star-rating';

@NgModule({
    imports: [
        ChartModule,
        NgxEchartsModule,
        NgxChartsModule,
        MatGridListModule,
        MatTooltipModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatExpansionModule,
        MatSortModule,
        MatCheckboxModule,
        MatRadioModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        CommonModule,
        FlexLayoutModule,
        FileUploadModule,
        ContentRoutingModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatMenuModule,
        MatListModule,
        MatCardModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatDialogModule,
        MatAutocompleteModule,
        MatSlideToggleModule,
        NgbModule.forRoot(),
        NbLayoutModule,
        NbThemeModule,
        NbCardModule,
        NbThemeModule.forRoot({ name: 'default' }),
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDrxBVzfTts6MuwA2RW3cvBGr32E_6XTVQ'
        }),
        StarRatingModule.forRoot(),
        NgxMaterialTimepickerModule.forRoot(),
        ChartsModule
    ],
    providers: [],
    declarations: [
        ContentComponent, BlankPageComponent, AddComponent, SearchComponent, EditComponent,
        TripComponent, MapComponent, RideComponent, TripViewComponent,
        SearchTripComponent, CancelTripComponent, NotifyPendingTripComponent,
        FinanceComponent, TripDetailsComponent, DataAnalystComponent, DispatcherComponent,
        DisputeComponent, DashboardComponent],
    entryComponents: [RideComponent, CancelTripComponent, NotifyPendingTripComponent, DisputeComponent]
})
export class ContentModule {
}
