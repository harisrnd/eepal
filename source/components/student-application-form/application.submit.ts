import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { Injectable } from "@angular/core";
import { NgRedux, select } from 'ng2-redux';
import { IAppState } from '../../store/store';
import { IStudentDataFields } from '../../store/studentdatafields/studentdatafields.types';
import { IRegions } from '../../store/regionschools/regionschools.types';
import { ICriter } from '../../store/criteria/criteria.types';
import { ISectors } from '../../store/sectorcourses/sectorcourses.types';
import { ISectorFields } from '../../store/sectorfields/sectorfields.types';
import { IEpalClasses } from '../../store/epalclasses/epalclasses.types';
import { STUDENT_DATA_FIELDS_INITIAL_STATE } from '../../store/studentdatafields/studentdatafields.initial-state';
import { CRITERIA_INITIAL_STATE } from '../../store/criteria/criteria.initial-state';
import { REGION_SCHOOLS_INITIAL_STATE } from '../../store/regionschools/regionschools.initial-state';
import { EPALCLASSES_INITIAL_STATE } from '../../store/epalclasses/epalclasses.initial-state';
import { SECTOR_COURSES_INITIAL_STATE } from '../../store/sectorcourses/sectorcourses.initial-state';
import { SECTOR_FIELDS_INITIAL_STATE } from '../../store/sectorfields/sectorfields.initial-state';
import { Student, StudentEpalChosen, StudentCourseChosen, StudentSectorChosen, StudentCriteriaChosen } from '../students/student';
import {AppSettings} from '../../app.settings';
import { ILoginInfo, ILoginInfoToken } from '../../store/logininfo/logininfo.types';
import { LOGININFO_INITIAL_STATE } from '../../store/logininfo/logininfo.initial-state';
import { EpalClassesActions } from '../../actions/epalclass.actions';
import { SectorFieldsActions } from '../../actions/sectorfields.actions';
import { RegionSchoolsActions } from '../../actions/regionschools.actions';
import { SectorCoursesActions } from '../../actions/sectorcourses.actions';
import { CriteriaActions } from '../../actions/criteria.actions';
import { StudentDataFieldsActions } from '../../actions/studentdatafields.actions';
import { HelperDataService } from '../../services/helper-data-service';

@Component({
    selector: 'application-submit',
    template: `
    <div class = "loading" *ngIf="(studentDataFields$ | async).size === 0 || (regions$ | async).size === 0 || (epalclasses$ | async).size === 0 || (loginInfo$ | async).size === 0 || (showLoader | async) === true"></div>
    <div id="studentFormSentNotice" (onHidden)="onHidden()" class="modal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static" data-keyboard="false">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header {{modalHeader | async}}">
              <h3 class="modal-title pull-left"><i class="fa fa-check-square-o"></i>&nbsp;&nbsp;{{ modalTitle | async }}</h3>
            <button type="button" class="close pull-right" aria-label="Close" (click)="hideModal()">
              <span aria-hidden="true"><i class="fa fa-times"></i></span>
            </button>
          </div>
          <div class="modal-body">
              <p>{{ modalText | async }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default pull-left" data-dismiss="modal" (click)="hideModal()">Κλείσιμο</button>
          </div>
        </div>
      </div>
    </div>
        <div class="row">
             <breadcrumbs></breadcrumbs>
        </div>

<!--        <application-preview-select></application-preview-select>   -->

        <div *ngFor="let loginInfoRow$ of loginInfo$ | async; let i=index;" style = "margin-bottom: 20px;" >
            <div class="row evenin" style="margin: 0px 2px 0px 2px; line-height: 2em;">
                <div class="col-md-12" style="font-size: 1em; font-weight: bold; text-align: center;">Στοιχεία αιτούμενου</div>
            </div>
            <div class="row oddin" style="margin: 0px 2px 0px 2px; line-height: 2em;">
                <div class="col-md-3" style="font-size: 0.8em;">Όνομα</div>
                <div class="col-md-3" style="font-size: 0.8em; font-weight: bold">{{ loginInfoRow$.cu_name }}</div>
                <div class="col-md-3" style="font-size: 0.8em;">Επώνυμο</div>
                <div class="col-md-3" style="font-size: 0.8em; font-weight: bold">{{ loginInfoRow$.cu_surname }}</div>
            </div>
            <div class="row oddin" style="margin: 0px 2px 0px 2px; line-height: 2em;">
                <div class="col-md-3" style="font-size: 0.8em;">Όνομα πατέρα</div>
                <div class="col-md-3" style="font-size: 0.8em; font-weight: bold">{{ loginInfoRow$.cu_fathername }}</div>
                <div class="col-md-3" style="font-size: 0.8em;">Όνομα μητέρας</div>
                <div class="col-md-3" style="font-size: 0.8em; font-weight: bold">{{ loginInfoRow$.cu_mothername }}</div>
            </div>
        </div>

        <div *ngFor="let studentDataField$ of studentDataFields$ | async;">

        <ul class="list-group left-side-view" style="margin-bottom: 20px;">
        <li class="list-group-item active">
            Στοιχεία μαθητή
        </li>
        </ul>
        <div><label for="name">Όνομα μαθητή</label> <p class="form-control" id="name" style="border:1px solid #eceeef;">   {{studentDataField$.name}} </p> </div>
        <div><label for="studentsurname">Επώνυμο μαθητή</label> <p class="form-control" id = "studentsurname" style="border:1px solid #eceeef;"> {{studentDataField$.studentsurname}} </p></div>
        <div><label for="fatherfirstname">Όνομα Πατέρα</label> <p class="form-control" id = "fatherfirstname" style="border:1px solid #eceeef;"> {{studentDataField$.fatherfirstname}} </p></div>
        <div><label for="fathersurname">Επώνυμο Πατέρα</label> <p class="form-control" id = "fathersurname" style="border:1px solid #eceeef;"> {{studentDataField$.fathersurname}} </p></div>
        <div><label for="motherfirstname">Όνομα Μητέρας</label> <p class="form-control" id = "motherfirstname" style="border:1px solid #eceeef;"> {{studentDataField$.motherfirstname}} </p></div>
        <div><label for="mothersurname">Επώνυμο Μητέρας</label> <p class="form-control" id = "mothersurname" style="border:1px solid #eceeef;"> {{studentDataField$.mothersurname}} </p></div>
        <div><label for="birthdate">Ημερομηνία Γέννησης</label> <p class="form-control" id = "birthdate" style="border:1px solid #eceeef;"> {{studentDataField$.studentbirthdate}} </p></div>
                <table>
                        <tr>
                            <td>
                                <div class="form-group">
                                    <label for="regionaddress">Διεύθυνση κατοικίας</label><p class="form-control" id = "regionaddress" style="border:1px solid #eceeef;"> {{studentDataField$.regionaddress}} </p>
                                </div>
                            </td>
                            <td>
                                <div class="form-group">
                                    <label for="regiontk">TK </label><p class="form-control" id = "regiontk" style="border:1px solid #eceeef;"> {{studentDataField$.regiontk}} </p>
                                </div>
                            </td>
                            <td>
                                <div class="form-group">
                                    <label for="regionarea">Πόλη/Περιοχή</label><p class="form-control" id = "regionarea" style="border:1px solid #eceeef;"> {{studentDataField$.regionarea}} </p>
                                </div>
                            </td>
                       </tr>
                </table>
                <div><label for="certificatetype">Τύπος απολυτηρίου</label> <p class="form-control" id = "certificatetype" style="border:1px solid #eceeef;"> {{studentDataField$.certificatetype}} </p></div>
                <div><label for="telnum">Τηλέφωνο επικοινωνίας</label> <p class="form-control" id = "telnum" style="border:1px solid #eceeef;"> {{studentDataField$.telnum}} </p></div>
                <div><label for="relationtostudent">Η αίτηση γίνεται από</label> <p class="form-control" id = "relationtostudent" style="border:1px solid #eceeef;"> {{studentDataField$.relationtostudent}} </p></div>

<!--                <ul class="list-group left-side-view" style="margin-bottom: 20px;">
                <li class="list-group-item active">
                            <div *ngIf="currentUrl === '/application-submit'">
                                   Κοινωνικά/Εισοδηματικά Κριτήρια
                            </div>
                </li>
                </ul>   -->
        </div>

<!--            <div *ngFor="let criteriaField$ of criteriaFields$ | async;">
            <div *ngIf="criteriaField$.selected === true">
                  {{criteriaField$.name}}
            </div>
            </div>  -->

            <div class="row" style="margin-top: 20px; margin-bottom: 20px;">
                <div class="col-md-6">
                    <button type="button" class="btn-primary btn-lg pull-left" (click)="navigateBack()">
                        <i class="fa fa-backward"></i>
                    </button>
                </div>
                <div class="col-md-6">
                    <button type="button"  *ngIf="(studentDataFields$ | async).size > 0 && (regions$ | async).size > 0 && (epalclasses$ | async).size > 0 && (loginInfo$ | async).size > 0" class="btn-primary btn-lg pull-right isclickable" style="width: 9em;" (click)="submitNow()">
                        <span style="font-size: 0.9em; font-weight: bold;">Υποβολή&nbsp;&nbsp;&nbsp;</span><i class="fa fa-forward"></i>
                    </button>
                </div>

            </div>

  `
})

@Injectable() export default class ApplicationSubmit implements OnInit {

    private authToken;
    private student;
    private epalSelected: Array<number> = new Array();
    private epalSelectedOrder: Array<number> = new Array();
    private studentCriteria: Array<number> = new Array();
    private courseSelected;
    private sectorSelected;
    private classSelected;
    private totalPoints=  <number>0;
    private studentDataFields$: BehaviorSubject<IStudentDataFields>;
    private regions$: BehaviorSubject<IRegions>;
    private criteria$: BehaviorSubject<ICriter>;
    private sectors$: BehaviorSubject<ISectors>;
    private sectorFields$: BehaviorSubject<ISectorFields>;
    private epalclasses$: BehaviorSubject<IEpalClasses>;
    private loginInfo$: BehaviorSubject<ILoginInfo>;
    private studentDataFieldsSub: Subscription;
    private regionsSub: Subscription;
    private criteriaSub: Subscription;
    private sectorsSub: Subscription;
    private sectorFieldsSub: Subscription;
    private epalclassesSub: Subscription;
    private loginInfoSub: Subscription;
    private modalTitle: BehaviorSubject<string>;
    private modalText: BehaviorSubject<string>;
    private modalHeader: BehaviorSubject<string>;
    public isModalShown: BehaviorSubject<boolean>;
    private showLoader: BehaviorSubject<boolean>;
    public currentUrl: string;
    private cu_name: string;
    private cu_surname: string;
    private cu_fathername: string;
    private cu_mothername: string;
    private disclaimer_checked: number;

    constructor(
                private _hds: HelperDataService,
                private _csa: SectorCoursesActions,
                private _sfa: SectorFieldsActions,
                private _rsa: RegionSchoolsActions,
                private _eca: EpalClassesActions,
                private _sdfa: StudentDataFieldsActions,
                private _cria: CriteriaActions,
                private _ngRedux: NgRedux<IAppState>,
                private router: Router,
                private http: Http
            ) {

                this.regions$ = new BehaviorSubject(REGION_SCHOOLS_INITIAL_STATE);
                this.epalclasses$ = new BehaviorSubject(EPALCLASSES_INITIAL_STATE);
                this.sectors$ = new BehaviorSubject(SECTOR_COURSES_INITIAL_STATE);
                this.sectorFields$ = new BehaviorSubject(SECTOR_FIELDS_INITIAL_STATE);
                this.studentDataFields$ = new BehaviorSubject(STUDENT_DATA_FIELDS_INITIAL_STATE);
                this.criteria$ = new BehaviorSubject(CRITERIA_INITIAL_STATE);
                this.loginInfo$ = new BehaviorSubject(LOGININFO_INITIAL_STATE);

                this.modalTitle =  new BehaviorSubject("");
                this.modalText =  new BehaviorSubject("");
                this.modalHeader =  new BehaviorSubject("");
                this.isModalShown = new BehaviorSubject(false);
                this.showLoader = new BehaviorSubject(false);
            };




    ngOnInit() {

        (<any>$('#studentFormSentNotice')).appendTo("body");
      this.loginInfoSub = this._ngRedux.select(state => {
          if (state.loginInfo.size > 0) {
              state.loginInfo.reduce(({}, loginInfoToken) => {
                  this.authToken = loginInfoToken.auth_token;

                  this.cu_name = loginInfoToken.cu_name;
                  this.cu_surname = loginInfoToken.cu_surname;
                  this.cu_fathername = loginInfoToken.cu_fathername;
                  this.cu_mothername = loginInfoToken.cu_mothername;
                  this.disclaimer_checked = loginInfoToken.disclaimer_checked;

                  return loginInfoToken;
              }, {});
          }
          return state.loginInfo;
      }).subscribe(this.loginInfo$);

      this.epalclassesSub = this._ngRedux.select(state => {
        if (state.epalclasses.size > 0) {
            state.epalclasses.reduce(({}, epalclass) => {
                this.classSelected = epalclass.name;
                return epalclass;
            }, {});
        }
        return state.epalclasses;
      }).subscribe(this.epalclasses$);

      this.studentDataFieldsSub = this._ngRedux.select(state => {
          if (state.studentDataFields.size > 0) {
              state.studentDataFields.reduce(({}, studentDataField) => {
                  this.student = studentDataField;
                  return studentDataField;
              }, {});
          }
          return state.studentDataFields;
      }).subscribe(this.studentDataFields$);

      this.regionsSub = this._ngRedux.select(state => {
          state.regions.reduce((prevRegion, region) =>{
              region.epals.reduce((prevEpal, epal) =>{
                  if (epal.selected === true) {
                    this.epalSelected.push(Number(epal.epal_id));
                    this.epalSelectedOrder.push(epal.order_id);
                  }
                  return epal;
              }, {});
              return region;
          }, {});
          return state.regions;
      }).subscribe(this.regions$);

/*      this.criteriaSub = this._ngRedux.select(state => {
          if (state.criter.size > 0) {
              state.criter.reduce(({}, criteria) => {
                //code to be replaced in next version
                  //if (criteria.selected === true && Number(criteria.id) !== 11)
                  if (criteria.selected === true )  {
                      this.studentCriteria.push(Number(criteria.id));
                      this.totalPoints = this.totalPoints + Number(criteria.points);
                    }

                  return criteria;
              }, {});
          }
          return state.criter;
      }).subscribe(this.criteria$); */

      this.sectorsSub = this._ngRedux.select(state => {
          state.sectors.reduce((prevSector, sector) =>{
              sector.courses.reduce((prevCourse, course) =>{
                  if (course.selected === true) {
                    this.courseSelected = course.course_id
                  }
                  return course;
              }, {});
              return sector;
          }, {});
          return state.sectors;
      }).subscribe(this.sectors$);

      this.sectorFieldsSub = this._ngRedux.select(state => {
          state.sectorFields.reduce(({}, sectorField) =>{
            if (sectorField.selected === true) {
              this.sectorSelected = sectorField.id
            }
            return sectorField;
          }, {});
          return state.sectorFields;
      }).subscribe(this.sectorFields$);

    };

    ngOnDestroy() {
        (<any>$('#studentFormSentNotice')).remove();
        if (this.studentDataFieldsSub) this.studentDataFieldsSub.unsubscribe();
//        if (this.criteriaSub) this.criteriaSub.unsubscribe();
        if (this.regionsSub) this.regionsSub.unsubscribe();
        if (this.sectorsSub) this.sectorsSub.unsubscribe();
        if (this.sectorFieldsSub) this.sectorFieldsSub.unsubscribe();
        if (this.epalclassesSub) this.epalclassesSub.unsubscribe();
        if (this.loginInfoSub) this.loginInfoSub.unsubscribe();
        this.regions$.unsubscribe();
        this.epalclasses$.unsubscribe();
        this.sectors$.unsubscribe();
        this.sectorFields$.unsubscribe();
        this.studentDataFields$.unsubscribe();
//        this.criteria$.unsubscribe();
        this.loginInfo$.unsubscribe();
    }

    submitNow() {
          //αποστολή στοιχείων μαθητή στο entity: epal_student
          // let aitisiObj: Array<Student | StudentEpalChosen[] | StudentCriteriaChosen[] | StudentCourseChosen | StudentSectorChosen > = [];
          let aitisiObj: Array<any> = [];
          let epalObj: Array<StudentEpalChosen> = [];
          let criteriaObj: Array<StudentCriteriaChosen> = [];

          aitisiObj[0] = this.student;
          aitisiObj[0].cu_name = this.cu_name;
          aitisiObj[0].cu_surname = this.cu_surname;
          aitisiObj[0].cu_fathername = this.cu_fathername;
          aitisiObj[0].cu_mothername = this.cu_mothername;
          aitisiObj[0].disclaimer_checked = this.disclaimer_checked;
          aitisiObj[0]['currentclass'] = this.classSelected;
          aitisiObj[0]['points'] = this.totalPoints;

          for (let i=0; i < this.epalSelected.length; i++)
            epalObj[i] =new StudentEpalChosen(null, this.epalSelected[i] , this.epalSelectedOrder[i]);
          aitisiObj['1'] =   epalObj;

//          for (let i=0; i < this.studentCriteria.length; i++)
//            criteriaObj[i] =new StudentCriteriaChosen(null, null, this.studentCriteria[i]);
//          aitisiObj['2'] = criteriaObj;

          if (aitisiObj[0]['currentclass'] === "2" )
            aitisiObj['3'] =  new StudentSectorChosen(null, this.sectorSelected);
          else if (aitisiObj[0]['currentclass'] === "3" || aitisiObj[0]['currentclass'] === "4" ) {
            aitisiObj['3'] =  new StudentCourseChosen(null, this.courseSelected);
          }

          this.submitRecord(aitisiObj);
  }


  submitRecord(record) {
    let authTokenPost = this.authToken + ":" + this.authToken;

    let headers = new Headers({
       "Authorization": "Basic " + btoa(authTokenPost),
       "Accept": "*/*",
       "Access-Control-Allow-Credentials": "true",
       "Content-Type": "application/json",
    });

    let options = new RequestOptions({ headers: headers,  method: "post", withCredentials: true });
    let connectionString = `${AppSettings.API_ENDPOINT}/epal/appsubmit`;
    this.showLoader.next(true);
    this.http.post(connectionString, record, options)
      .map((res: Response) => res.json())
      .subscribe(
      success => {
          (<any>$('.loading')).remove();
          this.showLoader.next(false);
          let errorCode = parseInt(success.error_code);
          if (errorCode === 0) {
              this.modalTitle.next("Υποβολή Αίτησης Εγγραφής");
              this.modalText.next("Η υποβολή της αίτησής σας πραγματοποιήθηκε. Μπορείτε να την εκτυπώσετε από την επιλογή 'Εμφάνιση - Εκτύπωση Αίτησης'. Θα ειδοποιηθείτε στο e-mail που δηλώσατε για την εξέλιξη της αίτησής σας");
              this.modalHeader.next("modal-header-success");
              this._eca.initEpalClasses();
              this._sfa.initSectorFields();
              this._rsa.initRegionSchools();
              this._csa.initSectorCourses();
              this._sdfa.initStudentDataFields();
              this._cria.initCriteria();
              console.log("success post");
              this.showModal();
          }
          else if (errorCode === 1001) {
              this.modalTitle.next("Αποτυχία Υποβολής Αίτησης");
              this.modalText.next("Δεν έχετε αποδεχθεί τους όρους χρήσης");
              this.modalHeader.next("modal-header-danger");
              console.log("no disclaimer checked");
              this.showModal();
          } else {
              this.modalTitle.next("Αποτυχία Υποβολής Αίτησης");
              this.modalText.next("Ελέξτε τη φόρμα σας. Υπάρχουν λάθη - ελλείψεις που δεν επιτρέπουν την υποβολή");
              this.modalHeader.next("modal-header-danger");
              console.log("other error");
              this.showModal();
          }
      },
      error => {
          (<any>$('.loading')).remove();
          this.showLoader.next(false);
          this.modalHeader.next("modal-header-danger");
          this.modalTitle.next("Υποβολή Αίτησης Εγγραφής");
          this.modalText.next("Η υποβολή της αίτησής σας απέτυχε. Παρακαλούμε προσπαθήστε πάλι και αν το πρόβλημα συνεχίσει να υφίσταται, επικοινωνήστε με την ομάδα υποστήριξης");
          this.showLoader.next(false);
          this.showModal();
          console.log("Error HTTP POST Service")},
      () => {
          console.log("write this message anyway");
          (<any>$('.loading')).remove();
          this.showLoader.next(false);
      },

      );

  }

  public showModal():void {
      (<any>$('#studentFormSentNotice')).modal('show');
  }

  public hideModal():void {
      console.log("going to post-submit from hide()");
      (<any>$('#studentFormSentNotice')).modal('hide');
      //(<any>$('.modal-backdrop')).remove();
      this.router.navigate(['/post-submit']);
  }

  public onHidden():void {
      this.isModalShown.next(false);
      console.log("going to post-submit");
      this.router.navigate(['/post-submit']);
  }

  navigateBack() {
      this.router.navigate(['/student-application-form-main']);
  }

}
