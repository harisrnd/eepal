import { NgRedux } from "@angular-redux/store";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs/Rx";

import { HelperDataService } from "../../services/helper-data-service";
import { LOGININFO_INITIAL_STATE } from "../../store/logininfo/logininfo.initial-state";
import { ILoginInfoRecords } from "../../store/logininfo/logininfo.types";
import { IAppState } from "../../store/store";

@Component({
    selector: "minister-settings",
    template: `

    <div
      class = "loading" *ngIf="dataRetrieved == -1 " >
    </div>

    <div id="configNotice" (onHidden)="onHidden()" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header {{modalHeader | async}}" >
              <h3 class="modal-title pull-left"><i class="fa fa-check-square-o"></i>&nbsp;&nbsp;{{ modalTitle | async }}</h3>
            <button type="button" class="close pull-right" aria-label="Close" (click)="hideModal()">
              <span aria-hidden="true"><i class="fa fa-times"></i></span>
            </button>
          </div>
          <div class="modal-body">
              <p>{{ modalText | async }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default pull-left" data-dismiss="modal">Κλείσιμο</button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="(loginInfo$ | async).size !== 0">

        <form [formGroup]="formGroup"  #form>
          <h5> >Ρυθμίσεις <br><br></h5>
          <div class="row">
            <div class="col-md-1 ">
              <input type="checkbox" [checked]="capacityDisabled"  formControlName="capacityDisabled"
              (click)="toggleCapacityFilter()" >
            </div>
            <div class="col-md-9">
              <label for="capacityDisabled">Απενεργοποίηση δυνατότητας τροποποίησης χωρητικότητας από τους Διευθυντές σχολείων</label>
            </div>
          </div>
          <br>

          <div class="row">
            <div class="col-md-1 ">
              <input type="checkbox" [checked]="directorViewDisabled" formControlName="directorViewDisabled"
              (click)="toggleDirectorView()" >
            </div>
            <div class="col-md-9">
              <label for="directorViewDisabled">Απενεργοποίηση δυνατότητας προβολής κατανομής μαθητών από τους Διευθυντές σχολείων</label>
            </div>
          </div>
          <br>

          <div class="row">
            <div class="col-md-1 ">
              <input type="checkbox" [checked]="applicantsLoginDisabled" formControlName="applicantsLoginDisabled"
              (click)="toggleApplicantsLogin()" >
            </div>
            <div class="col-md-9">
              <label for="applicantsLoginDisabled">Απενεργοποίηση δυνατότητας υποβολής δήλωσης προτίμησης ΕΠΑΛ</label>
            </div>
          </div>
          <br>

          <div class="row">
            <div class="col-md-1 ">
              <input type="checkbox" [checked]="applicantsResultsDisabled" formControlName="applicantsResultsDisabled"
              (click)="toggleApplicantsResults()" >
            </div>
            <div class="col-md-9">
              <label for="applicantsResultsDisabled">Απενεργοποίηση δυνατότητας προβολής αποτελεσμάτων κατανομής από τους μαθητές </label>
            </div>
          </div>
          <br>

          <div class="row">
            <div class="col-md-1 ">
              <input type="checkbox" [checked]="secondPeriodEnabled" formControlName="secondPeriodEnabled"
              (click)="toggleSecondPeriod()" >
            </div>
            <div class="col-md-9">
              <label for="secondPeriodEnabled">Ενεργοποίηση δεύτερης περιόδου αιτήσεων </label>
            </div>
          </div>
          <br>

          <button type="submit" class="btn btn-md pull-right"  (click)="storeSettings()" >
              Εφαρμογή
          </button>

        </form>

      </div>

   `
})

@Injectable() export default class MinisterSettings implements OnInit, OnDestroy {

    private formGroup: FormGroup;
    private loginInfo$: BehaviorSubject<ILoginInfoRecords>;
    private modalTitle: BehaviorSubject<string>;
    private modalText: BehaviorSubject<string>;
    private modalHeader: BehaviorSubject<string>;
    private settings$: BehaviorSubject<any>;
    private loginInfoSub: Subscription;
    private settingsSub: Subscription;

    private capacityDisabled: boolean;
    private directorViewDisabled: boolean;
    private applicantsLoginDisabled: boolean;
    private applicantsResultsDisabled: boolean;
    private secondPeriodEnabled: boolean;
    private dataRetrieved: number;

    private minedu_userName: string;
    private minedu_userPassword: string;

    constructor(private fb: FormBuilder,
        private _ngRedux: NgRedux<IAppState>,
        private _hds: HelperDataService,
        private router: Router) {

        this.formGroup = this.fb.group({
            capacityDisabled: ["", []],
            directorViewDisabled: ["", []],
            applicantsLoginDisabled: ["", []],
            applicantsResultsDisabled: ["", []],
            secondPeriodEnabled: ["", []],
        });

        this.loginInfo$ = new BehaviorSubject(LOGININFO_INITIAL_STATE);
        this.settings$ = new BehaviorSubject([{}]);
        this.modalTitle = new BehaviorSubject("");
        this.modalText = new BehaviorSubject("");
        this.modalHeader = new BehaviorSubject("");

    }

    public showModal(): void {
        (<any>$("#configNotice")).modal("show");
    }

    public hideModal(): void {
        (<any>$("#configNotice")).modal("hide");
    }

    public onHidden(): void {
        // this.isModalShown.next(false);
    }


    ngOnDestroy() {

        (<any>$("#configNotice")).remove();

        if (this.loginInfoSub)
            this.loginInfoSub.unsubscribe();
        if (this.settingsSub)
            this.settingsSub.unsubscribe();
    }

    ngOnInit() {

        (<any>$("#configNotice")).appendTo("body");

        this.loginInfoSub = this._ngRedux.select("loginInfo")
            .map(loginInfo => <ILoginInfoRecords>loginInfo)
            .subscribe(loginInfo => {
                if (loginInfo.size > 0) {
                    loginInfo.reduce(({}, loginInfoObj) => {
                        this.minedu_userName = loginInfoObj.minedu_username;
                        this.minedu_userPassword = loginInfoObj.minedu_userpassword;
                        return loginInfoObj;
                    }, {});
                }
                this.loginInfo$.next(loginInfo);
            }, error => console.log("error selecting loginInfo"));

        this.retrieveSettings();

    }

    retrieveSettings() {

        this.dataRetrieved = -1;

        this.settingsSub = this._hds.retrieveAdminSettings(this.minedu_userName, this.minedu_userPassword).subscribe(data => {
            this.settings$.next(data);
            this.capacityDisabled = Boolean(Number(this.settings$.value["capacityDisabled"]));
            this.directorViewDisabled = Boolean(Number(this.settings$.value["directorViewDisabled"]));
            this.applicantsLoginDisabled = Boolean(Number(this.settings$.value["applicantsLoginDisabled"]));
            this.applicantsResultsDisabled = Boolean(Number(this.settings$.value["applicantsResultsDisabled"]));
            this.secondPeriodEnabled = Boolean(Number(this.settings$.value["secondPeriodEnabled"]));

            this.dataRetrieved = 1;
        },
            error => {
                this.settings$.next([{}]);
                this.dataRetrieved = 0;
                console.log("Error Getting MinisterRetrieveSettings");
            });
    }

    storeSettings() {

        this.dataRetrieved = -1;

        this.settingsSub = this._hds.storeAdminSettings(this.minedu_userName, this.minedu_userPassword,
            this.capacityDisabled, this.directorViewDisabled, this.applicantsLoginDisabled, this.applicantsResultsDisabled, this.secondPeriodEnabled)
            .subscribe(data => {
                this.settings$.next(data);
                this.dataRetrieved = 1;

                this.modalTitle.next("Ρύθμιση Παραμέτρων");
                this.modalText.next("Έγινε εφαρμογή των νέων σας ρυθμίσεων.");
                this.modalHeader.next("modal-header-success");
                this.showModal();
            },
            error => {
                this.settings$.next([{}]);
                this.dataRetrieved = 0;
                console.log("Error Getting MinisterStoreSettings");

                this.modalTitle.next("Ρύθμιση Παραμέτρων");
                this.modalText.next("ΑΠΟΤΥΧΙΑ εφαρμογής των νέων σας ρυθμίσεων.");
                this.modalHeader.next("modal-header-danger");
                this.showModal();
            });
    }

    toggleCapacityFilter() {
        this.capacityDisabled = !this.capacityDisabled;
    }

    toggleDirectorView() {
        this.directorViewDisabled = !this.directorViewDisabled;
    }

    toggleApplicantsLogin() {
        this.applicantsLoginDisabled = !this.applicantsLoginDisabled;
    }

    toggleApplicantsResults() {
        this.applicantsResultsDisabled = !this.applicantsResultsDisabled;
    }

    toggleSecondPeriod() {
        this.secondPeriodEnabled = !this.secondPeriodEnabled;
    }

}
