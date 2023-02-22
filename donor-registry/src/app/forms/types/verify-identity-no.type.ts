import { Component, ElementRef, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import {
  GeneralService,
  getDonorServiceHost,
} from '../../services/general/general.service';
@Component({
  selector: 'verify-identity-code',
  styleUrls: ['../forms.component.scss'],
  template: `
    <div>
      <span class="fw-bold p12">{{ to.label }} *</span> <br />
      <div class="d-flex">
        <input
          id="{{ field.key }}"  maxLength="14" 
          [formControl]="formControl"
          [formlyAttributes]="field"
          pattern="[9]{1}[1]{1}[0-9]{12}"
          [ngClass]="isIdentityNo ? 'form-control' : 'form-control is-invalid'"
          required
        />
        <span
          class="text-primary fw-bold p-1 p14 pointer"
          *ngIf="!isVerify"
          (click)="verifyOtp(field.key)"
          data-toggle="modal"
          data-target="#verifyOtp"
          >Verify</span
        >
        <span class="text-success verifyIcon fw-bold p-1" *ngIf="isVerify">
          <i class="fa fa-check-circle" aria-hidden="true"></i>
        </span>
      </div>
      <div *ngIf="signupForm" class="p12">
        {{ 'LINK_TO_ABHA' | translate }}
        <a href="http://healthidsbx.abdm.gov.in/" target="_blank">{{
          'LINK' | translate
        }}</a>
      </div>
      <div class="p12" id="abhamessage"></div>
      
      <br />

      <div
        *ngIf="!canRegister || isIdentityNo || isGotErr"
        class="modal fade"
        id="verifyOtp"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
        data-backdrop="static"
        data-keyboard="false"
      >
        <div *ngIf="!canRegister && !isGotErr" class="modal-dialog" role="document">
          <div class="p-4 modal-content">
            <div class="modal-body text-center">
              <h3 class="fw-bold mb-3">Cannot register for Pledge</h3>
              <p class="p14">You are not eligible to pledge for donation.</p>
              <p class="p14">
                Only individuals of age 18 year or above can pledge.
              </p>
              <a href="http://">Click here for more information</a>
              <br />
              <br />
              <button
                m
                type="button"
                class="btn btn-primary-notto btn-style w-100 submit-button mb-2"
                (click)="previous()"
              >
                Ok
              </button>
            </div>
          </div>
        </div>


        <div *ngIf="isGotErr" class="modal-dialog" role="document">
        <div class="p-4 modal-content">
            <div class="modal-body text-center">
                <div class="d-flex flex-column justify-content-center align-items-center">
                   <div *ngIf="isAbhaNoErr">
                   <span *ngIf="!errorMessage" class="p24 mb-2 mt-2 mb-2 fw-bold">Invalid ABHA number</span>
                   <span *ngIf="customErrCode == '420'" class="p24 mb-2 mt-2 mb-2 fw-bold">ABHA number entered multiple times</span>


                   
                   <span *ngIf="errorMessage" class="p24 mb-2 mt-2 mb-2 fw-bold">{{errorMessage}}</span>

                    <br /> <br />
                 
                   <span>Please enter valid ABHA number</span> <br />
                
                    </div>

                    <div *ngIf="!isAbhaNoErr">
                    <span *ngIf="!errorMessage" class="p24 mb-2 mt-2 mb-2 fw-bold">Invalid ABHA number</span>
                    <span *ngIf="customErrCode == '401'" class="p24 mb-2 mt-2 mb-2 fw-bold">Please enter valid ABHA number</span>

                    <span *ngIf="errorMessage" class="p24 mb-2 mt-2 mb-2 fw-bold">{{errorMessage}}</span>
                    <br />
                    <br />
                     </div>
                    <div class="container-fluid mt-3">
                        <button type="button" class=" btn btn-primary-notto btn-style w-100 submit-button mb-2"
                            data-dismiss="modal" aria-label="Close">OK</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

        <div *ngIf="true" class="modal-dialog" role="document">
          <div class="p-4 modal-content">
            <div
              class="close float-end"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span class=" float-end" aria-hidden="true">&times;</span>
            </div>
            <div class="modal-body">
              <h3 class="fw-bold mb-3">Confirm OTP</h3>
              <p class="p14">
                Enter the code sent to mobile number associated with your ID
              </p>
              <span class="fw-bold p12"> Enter OTP</span> <br />
              <input
                type="input"
                [(ngModel)]="optVal"
                name="optVal"
                class="form-control"
              />
              <span *ngIf="!errorMessage" class="p12 red lh-32">{{errorMessage}}</span>
              <br />
              <button
                m
                type="button"
                (click)="submitOtp()"
                class="btn btn-primary-notto btn-style w-100 submit-button mb-2"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
        <button
          id="openModalButton"
          [hidden]="true"
          data-toggle="modal"
          data-
          target="#verifyOtp"
        >
          Open Modal
        </button>
        <button
          id="closeModalButton"
          [hidden]="true"
          data-toggle="modal"
          data-target="#verifyOtp"
          class="btn btn-default"
          data-dismiss="modal"
        >
          Close
        </button>
      </div>

     

    </div>
  `,
})
export class VerifyIndentityCode extends FieldType {
  data: any;
  res = 'Verify';
  isVerify: boolean = false;
  optVal: string;
  number: string;
  isIdentityNo: boolean = true;
  canRegister: boolean = true;
  isGotErr: boolean = false;

  transactionId: string;
  model1: any;
  errorMessage: any;
  data1: any;
  // @Output() sendData1 = new EventEmitter<any>();
  model2: any;
 signupForm: boolean;
  isAbhaNoErr: boolean = false;
  customErrCode: string;
  constructor(private http: HttpClient, public generalService: GeneralService,public router: Router,) {
    super();
  }

  ngOnInit(): void {
    if(this.router.url == "/form/signup"){
      this.signupForm = true;
     }
    localStorage.removeItem('form_value');
    if (localStorage.getItem('isVerified') === 'true') {
      this.isVerify = true;
    }
  }

  async verifyOtp(value) {
    this.isIdentityNo = true;
    this.canRegister = true;
    this.isGotErr = false;

    this.number = (<HTMLInputElement>document.getElementById(value)).value;
    if (this.number) {
      this.model1 = {
        healthId: this.number,
      };

      await this.http
        .post<any>(`${getDonorServiceHost()}/auth/sendOTP`, this.model1)
        .subscribe({
          next: (data) => {
            this.isGotErr = false;
            this.isIdentityNo = true;
            console.log(data);
            this.transactionId = data.txnId;
          },
          error: (error) => {

            this.checkErrType(error);
           // this.errorMessage = error?.error['message'];

            if (
              localStorage.getItem('formtype') != 'recipient' &&
              localStorage.getItem('formtype') != 'livedonor'
            ) {
              // alert(this.errorMessage);
            }
            this.isGotErr = true;
            this.isAbhaNoErr = true;

            // this.isIdentityNo = true;
            //  console.error('There was an error!', error);
          },
        });
    } else {
      this.isIdentityNo = false;
    }
  }

  previous = () => {
    window.history.back();
  };

  checkErrType(err)
  {
    let errorMessage = err?.error['message'];
    if(errorMessage.includes('30'))
    {
      this.customErrCode = '420';
    }


  }

  submitOtp() {
    if (this.optVal) {
      this.model2 = {
        transactionId: this.transactionId,
        otp: this.optVal,
      };

      localStorage.setItem('isAutoFill', 'true');

      this.http
        .post<any>(`${getDonorServiceHost()}/auth/verifyOTP`, this.model2)
        .subscribe({
          next: (data) => {
            this.isIdentityNo = true;
            this.isVerify = true;
  	    this.isGotErr = false;
            let dateSpan = document.getElementById('abhamessage');
            dateSpan.classList.remove('text-danger');
            dateSpan.innerText = "";
            document.getElementById('abha').classList.remove('is-invalid');
            (document.getElementById('abha') as any).disabled = true;

            this.data1 = data;
            let dayOfBirth = data?.dayOfBirth;
            let monthOfBirth = data?.monthOfBirth;
            let yearOfBirth = data?.yearOfBirth;
            let dateFull = `${monthOfBirth}/${dayOfBirth}/${yearOfBirth}`;
            let dob = new Date(dateFull);
            let month_diff = Date.now() - dob.getTime();
            let age_dt = new Date(month_diff);
            let year = age_dt.getUTCFullYear();
            let age = Math.abs(year - 1970);

            if (age < 18) {
              this.canRegister = false;
              this.isIdentityNo = false;
            } else {
              const healthIdNumber = this.data1.healthIdNumber.replaceAll(
                '-',
                ''
              );
              localStorage.setItem(healthIdNumber, JSON.stringify(this.data1));
              localStorage.setItem('form_value', JSON.stringify(this.data1));
              localStorage.setItem('isVerified', JSON.stringify(this.isVerify));
              document.getElementById('closeModalButton').click();
              setTimeout(() => {
                (document.getElementById('abha') as any).focus();
              }, 1000);
            }
          },
          error: (error) => {
            this.errorMessage = error?.error['message'];
            this.customErrCode = (error?.error['status'])? error?.error['status'] : "";
            if( error?.error['status'] != '401')
            {
              this.isGotErr = true;
              this.isAbhaNoErr = false;
              this.isIdentityNo = true;
            }
         
            console.error('There was an error!', error);
          },
        });
    }
  }
}
