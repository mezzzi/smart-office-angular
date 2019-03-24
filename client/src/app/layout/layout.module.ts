import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NbLayoutModule, NbThemeModule, NbSidebarModule, NbSearchModule, NbSidebarService} from '@nebular/theme';
import {
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatExpansionModule,
    MatBottomSheetModule,
    MatChipsModule,
    MatDialogModule
} from '@angular/material';


import { MatTooltipModule} from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopNavComponent } from './topnav/top-nav.component';
import { TripNotificationsComponent } from './topnav/top-nav.component';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        LayoutRoutingModule,
        MatBadgeModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatListModule,
        MatCardModule,
        MatTooltipModule,
        MatExpansionModule,
        TranslateModule,
        FormsModule,
        MatBadgeModule,
        MatBottomSheetModule,
        NbThemeModule.forRoot({name: 'default'}),
        NbLayoutModule,
        NbSidebarModule,
        NbSearchModule,
        MatChipsModule,
        MatDialogModule
    ],
    declarations: [LayoutComponent, TopNavComponent, SidebarComponent, TripNotificationsComponent],
    entryComponents: [TripNotificationsComponent],
    providers: [NbSidebarService]
})
export class LayoutModule {
}
