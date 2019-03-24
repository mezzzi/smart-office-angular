import { LayoutModule } from '@angular/cdk/layout';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatCheckboxModule, MatInputModule, MatCardModule, MatAutocompleteModule } from '@angular/material';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { LocationService, MainService, UserService, AuthService, TripService } from './shared/services';
import { TokenInterceptor } from './shared/interceptor/token.interceptor';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatAutocomplete, MatOptionModule, MatListModule, MatIconModule } from '@angular/material';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpService } from './shared/services/http.service';
import { CorporateClientService } from './shared/services/corporate.client.service';
import { ShiftReportComponent } from './contents/shift-report/shift-report.component';
// AoT requires an exported function for factories
export const createTranslateLoader = (http: HttpClient) => {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
};

@NgModule({
    declarations: [AppComponent, LoginComponent, ShiftReportComponent],
    imports: [
        LayoutModule, // local module
        MatSnackBarModule,
        MatProgressSpinnerModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        OverlayModule,
        HttpClientModule,
        CommonModule,
        MatProgressBarModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatOptionModule,
        MatAutocompleteModule,
        MatIconModule,
        MatListModule,
        MatButtonModule, MatCheckboxModule, MatInputModule, MatCardModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            }
        }),

    ],
    providers: [MainService, AuthService, UserService, CorporateClientService, LocationService,
        TripService, HttpService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        MatSnackBar
    ],
    bootstrap: [AppComponent],
    entryComponents: [ShiftReportComponent]
})
export class AppModule {
}
