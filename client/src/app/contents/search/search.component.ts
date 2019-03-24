import { Component, OnInit, ViewChild } from '@angular/core';
import { ServerResponse } from '../../shared/interfaces';
import { User } from '../../shared/models';
import { AuthService, UserService } from '../../shared/services';
import { MatPaginator, MatSort, MatTableDataSource, MatSnackBar } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { RouteConfig, Level } from '../../shared/configs';
import { handleError, LogUtil } from '../../shared/utils';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {

    displayedColumns: String[];
    dataSource: MatTableDataSource<User>;
    selection = new SelectionModel<User>(true, []);

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    private users: User[];
    private deleteIndex: number;
    loaded = false;

    constructor(private userService: UserService, authService: AuthService, private router: Router,
                private snackBar: MatSnackBar) {
        this.loaded = false;
        this.displayedColumns = authService.getManagingUserLevel() === Level.FINANCE ?
            ['select', 'name', 'email', 'phone', 'account_status'] :
            ['select', 'name', 'email', 'phone', 'account_status'];
    }

    ngOnInit() {
        this.userService.getAllUsers()
            .subscribe(
                response => this.handleSearchResponse(response),
                error => handleError(error)
            );
    }

    get managed_user_label(): string {
        return this.userService.getManagedUserLabel();
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // DataSource defaults to lowercase matches
        this.dataSource.filter = filterValue;
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    handleSearchResponse(resp: any) {
        if (resp.success) {
            this.users = resp.data;
            // Assign the data to the data source for the table to render
            this.dataSource = new MatTableDataSource(this.users);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.loaded = true;
        } else {
            LogUtil.NagNag('Could not fetch from server');
            this.loaded = true;
        }
    }

    showDeleteOption(): boolean {
        return this.selection.selected.length > 0;
    }

    showEditOption(): boolean {
        return this.selection.selected.length === 1;
    }

    editSelection() {
        LogUtil.ConsoleNag('about to edit selection');
        this.editUser(this.selection.selected[0]);
    }

    deleteSelection() {
        const selectedRows = this.selection.selected;
        const deleteIds: string[] = [];
        for (const row of selectedRows) {
            deleteIds.push(row._id);
        }
        deleteIds.map(id => {
            this.userService.deleteUser(id).subscribe(
                response => this.handleDeleteResponse(response),
                error => handleError(error)
            );
        });
    }

    editUser(user: User) {
        const managedUserLevel = this.userService.getManagedUserLevel();
        let routeLabel = '';
        if (managedUserLevel === Level.DISPATCHER) {
            routeLabel = RouteConfig.ROUTE_EDIT_DISPATCHER;
        } else if (managedUserLevel === Level.CORPORATE_CLIENT) {
            routeLabel = RouteConfig.ROUTE_EDIT_CORPORATE;
        } else if (managedUserLevel === Level.DISPATCHER_SUPERVISOR) {
            routeLabel = RouteConfig.ROUTE_EDIT_DISPATCHER_SUPERVISOR;
        } else if (managedUserLevel === Level.CUSTOMER) {
            routeLabel = RouteConfig.ROUTE_EDIT_CUSTOMER;
        } else if (managedUserLevel === Level.DRIVER) {
            routeLabel = RouteConfig.ROUTE_EDIT_DRIVER;
        } else if (managedUserLevel === Level.SUPERVISOR) {
            routeLabel = RouteConfig.ROUTE_EDIT_SUPERVISOR;
        } else if (managedUserLevel === Level.FINANCE) {
            routeLabel = RouteConfig.ROUTE_EDIT_FINANCE;
        } else if (managedUserLevel === Level.DATA_ANALYST) {
            routeLabel = RouteConfig.ROUTE_EDIT_DATA_ANALYST;
        } else {
            routeLabel = null;
            LogUtil.AlertNag('Invalid managed user level for show AddForm');
        }
        if (routeLabel !== null) {
            this.router.navigate([routeLabel, user._id]).catch(
                reason => {
                    LogUtil.ConsoleNag(`Could not navigate to edit: ${routeLabel}`);
                }
            );
        }
    }

    handleDeleteResponse(resp: ServerResponse) {
        if (resp.success) {
            this.userService.getAllUsers()
                .subscribe(
                    response => {
                        this.users = response.data;
                        this.dataSource.data = response.data;
                        this.selection = new SelectionModel<User>(true, []);
                        this.snackBar.open('Successfully Removed User', 'OK');
                    },
                    error => handleError(error)
                );
            // this.users.splice(this.deleteIndex, 1);
            // this.dataSource = new MatTableDataSource<User>(this.users);
            // this.selection = new SelectionModel<User>(true, []);
            LogUtil.ConsoleNag('Successfully deleted');
        } else {
            window.alert('Could not add');
            LogUtil.ConsoleNag(resp.msg);
        }
    }

}
