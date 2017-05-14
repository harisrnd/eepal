import { Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { Injectable } from "@angular/core";
import { RegionSchoolsActions } from '../../actions/regionschools.actions';
import { NgRedux, select } from 'ng2-redux';
import { IRegions } from '../../store/regionschools/regionschools.types';
import { REGION_SCHOOLS_INITIAL_STATE } from '../../store/regionschools/regionschools.initial-state';
import { EPALCLASSES_INITIAL_STATE } from '../../store/epalclasses/epalclasses.initial-state';
import { SECTOR_COURSES_INITIAL_STATE } from '../../store/sectorcourses/sectorcourses.initial-state';
import { SECTOR_FIELDS_INITIAL_STATE } from '../../store/sectorfields/sectorfields.initial-state';
import { SectorCoursesActions } from '../../actions/sectorcourses.actions';
import { ISectors } from '../../store/sectorcourses/sectorcourses.types';
import { IAppState } from '../../store/store';
import { RemoveSpaces } from '../../pipes/removespaces';
import { IEpalClasses } from '../../store/epalclasses/epalclasses.types';
import { ISectorFields } from '../../store/sectorfields/sectorfields.types';


import {
    FormBuilder,
    FormGroup,
    FormControl,
    FormArray
} from '@angular/forms';
import {AppSettings} from '../../app.settings';

@Component({
    selector: 'region-schools-select',
    template: `
    <div class="row">
             <breadcrubs></breadcrubs>
    </div>

    <div class = "loading" *ngIf="(regions$ | async).size === 0">
    </div>
<!--     <div class="row equal">
      <div class="col-md-12"> -->
      <h4> Επιλογή Σχολείου</h4>
       <form [formGroup]="formGroup">
        <div formArrayName="formArray">
        <p style="margin-top: 20px; line-height: 2em;"> Παρακαλώ επιλέξτε <strong>τρία </strong> ΕΠΑΛ στα οποία θα ήθελε να φοιτήσει ο μαθητής. Επιλέξτε πρώτα την Περιφερειακή Διεύθυνση που ανήκει το κάθε σχολείο της επιλογής σας, επιλέξτε τα σχολεία και στη συνέχεια επιλέξτε <i>Συνέχεια</i>. 
        Μπορείτε να επιλέξετε σχολεία που ανήκουν σε περισσότερες απο μια Περιφερειακές Διευθύνσεις. <strong> Προσοχή!</strong> Σε ειδικές περιπτώσεις σχολείων μπορείτε να επιλέξετε και λιγότερα απο τρία σχολεία</p>
            <ul class="list-group main-view">
            <div *ngFor="let region$ of regions$ | async; let i=index; let isOdd=odd; let isEven=even"  >
                <li class="list-group-item isclickable" (click)="setActiveRegion(i)" [class.oddout]="isOdd" [class.evenout]="isEven" [class.selectedout]="regionActive === i">
                    <h5>{{region$.region_name}}</h5>
                </li>

                <div *ngFor="let epal$ of region$.epals; let j=index; let isOdd2=odd; let isEven2=even" [class.oddin]="isOdd2" [class.evenin]="isEven2" [hidden]="i !== regionActive">

                        <div class="row">
                            <div class="col-md-2 col-md-offset-1">
                                <input #cb type="checkbox" formControlName="{{ epal$.globalIndex }}"
                                (change)="saveSelected(cb.checked,i,j)"
                                [hidden] = "numSelected === 3 && cb.checked === false"
                                >
                             </div>
                            <div class="col-md-8  col-md-offset-1 isclickable">
                                {{epal$.epal_name | removeSpaces}}
                            </div>
                        </div>

                </div>

            </div>
            </ul>
        </div>
        <div class="row" style="margin-top: 20px;" *ngIf="(regions$ | async).size > 0">
        <div class="col-md-6">
            <button type="button" class="btn-primary btn-lg pull-left" (click)="navigateBack()" >
          <i class="fa fa-backward"></i>
            </button>
        </div>
        <div class="col-md-6">
            <button type="button" class="btn-primary btn-lg pull-right" (click)="navigateToApplication()" [disabled] = "selectionLimitOptional === false && numSelected < selectionLimit "  >
          <i class="fa fa-forward"></i>
            </button>
        </div>
        </div>
    </form>
  `
})
@Injectable() export default class RegionSchoolsSelect implements OnInit, OnDestroy {
    private epalclasses$: BehaviorSubject<IEpalClasses>;
    private regions$: BehaviorSubject<IRegions>;
    private sectors$: BehaviorSubject<ISectors>;
    private sectorFields$: BehaviorSubject<ISectorFields>;
    private epalclassesSub: Subscription;
    private regionsSub: Subscription;
    private sectorsSub: Subscription;
    private sectorFieldsSub: Subscription;

    private formGroup: FormGroup;
    private rss = new FormArray([]);
    private classActive = "-1";
    private regionActive = <number>-1;
    private regionActiveId = <number>-1;
    private courseActive = <number>-1;
    private numSelected = <number>0;
    private selectionLimit = <number>3;
    private regionSizeLimit = <number>3;
    private selectionLimitOptional = <boolean>false;
    //private schoolArray: Array<boolean> = new Array();

    constructor(private fb: FormBuilder,
                private _rsa: RegionSchoolsActions,
                private _rsb: SectorCoursesActions,
                private _ngRedux: NgRedux<IAppState>,
                private router: Router

            ) {
        this.regions$ = new BehaviorSubject(REGION_SCHOOLS_INITIAL_STATE);
        this.epalclasses$ = new BehaviorSubject(EPALCLASSES_INITIAL_STATE);
        this.sectors$ = new BehaviorSubject(SECTOR_COURSES_INITIAL_STATE);
        this.sectorFields$ = new BehaviorSubject(SECTOR_FIELDS_INITIAL_STATE);
        this.formGroup = this.fb.group({
            formArray: this.rss

        });

    };

    ngOnInit() {

        this.selectEpalClasses();

        this.selectRegionSchools();
    }

    ngOnDestroy() {
        if (this.epalclassesSub) {
            this.epalclassesSub.unsubscribe();
        }
        if (this.regionsSub) {
            this.regionsSub.unsubscribe();
        }
        if (this.sectorsSub) {
            this.sectorsSub.unsubscribe();
        }
        if (this.sectorFieldsSub) {
            this.sectorFieldsSub.unsubscribe();
        }
        if (this.sectorFields$) this.sectorFields$.unsubscribe();
        if (this.sectors$) this.sectors$.unsubscribe();
        if (this.regions$) this.regions$.unsubscribe();
        if (this.epalclasses$) this.epalclasses$.unsubscribe();
    }

    selectEpalClasses() {
        this.epalclassesSub = this._ngRedux.select(state => {
          if (state.epalclasses.size > 0) {
              state.epalclasses.reduce(({}, epalclass, i) => {
                  this.setClassActive(epalclass.name);
                  this.getAppropriateSchools(epalclass.name);
                  return epalclass;
              }, {});
          }
          return state.epalclasses;
      }).subscribe(this.epalclasses$);
    }

    selectRegionSchools() {

        this.regionsSub = this._ngRedux.select(state => {
            let numsel = 0;
            let numreg = 0;   //count reduced regions in order to set activeRegion when user comes back to his choices
            this.selectionLimitOptional = false;

            state.regions.reduce((prevRegion, region) =>{
                numreg++;
                region.epals.reduce((prevEpal, epal) =>{
                    this.rss.push( new FormControl(epal.selected, []));
                    if (epal.selected === true) {
                      numsel++;
                      if ( epal.epal_special_case === "1") {
                        this.selectionLimitOptional = true;
                      }
                      this.regionActiveId = Number(region.region_id);
                      this.regionActive = numreg - 1;
                    }
                    if (Number(region.region_id) ===  this.regionActiveId)  {
                      if (region.epals.length < this.regionSizeLimit)
                        this.selectionLimitOptional = true;
                    }
                    return epal;
                }, {});

                return region;
            }, {});
            this.numSelected = numsel;
            return state.regions;
        }).subscribe(this.regions$);
    }

    setClassActive(className) {
        this.classActive = className;
    }

    getAppropriateSchools(epalClass) {

        if (epalClass === "1")  {
            this._rsa.getRegionSchools(1,"-1", false);
        }
        else if (epalClass === "2") {
            this.sectorFieldsSub = this._ngRedux.select(state => {
                state.sectorFields.reduce(({}, sectorField) =>{
                    if (sectorField.selected === true) {
                        this.courseActive = sectorField.id;
                        this._rsa.getRegionSchools(2,this.courseActive, false);
                    }
                    return sectorField;
                }, {});
                return state.sectorFields;
            }).subscribe(this.sectorFields$);
        }
        else if (epalClass === "3")  {
            this.sectorsSub = this._ngRedux.select(state => {
                state.sectors.reduce((prevSector, sector) =>{
                      if (sector.sector_selected === true) {
                          sector.courses.reduce((prevCourse, course) =>{
                              if (course.selected === true) {
                                  this.courseActive = parseInt(course.course_id);
                                  this._rsa.getRegionSchools(3,this.courseActive, false);
                              }
                              return course;
                          }, {});
                      }
                    return sector;
                }, {});
                return state.sectors;
            }).subscribe(this.sectors$);
        }
    }

    navigateBack() {
//        this.router.navigate(['/epal-class-select']);
        if (this.classActive === "1")  {
            this.router.navigate(['/epal-class-select']);
        }
        else if (this.classActive === "2") {
            this.router.navigate(['/sector-fields-select']);
        }
        else if (this.classActive === "3")  {
            this.router.navigate(['/sectorcourses-fields-select']);
        }
    }

    setActiveRegion(ind) {
      if (ind === this.regionActive)
        ind = -1;
      this.regionActive = ind;
    }

    saveSelected(checked,i,j) {
        this._rsa.saveRegionSchoolsSelected(checked, i, j);
    }

    navigateToApplication() {
        this.router.navigate(['/schools-order-select']);
    }

}
