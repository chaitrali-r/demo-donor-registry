import { Component, ElementRef, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { GeneralService, getDonorServiceHost } from '../../services/general/general.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'verify-aadhar',
  styleUrls: ['../forms.component.scss'],
  templateUrl: './verify-aadhar.type.html',
})
export class VerifyAadhar extends FieldType {
  isVerify: boolean = false;
  aadharnumbernumber: string;
  transactionId: any;
  optVal: any;
  linkedAbhaList: any;
  isAllAbhaRegister: boolean = false;
  selectedProfile: any;
  selected: boolean = false;
  dataObj: any;
  isNumberValid: boolean = true;
  errorMessage: any;
  customErrCode: string = '';
  err401: boolean = false;
  noLinkedAbha: boolean = false;
  fieldKey: any;
  canRegister: boolean = true;
  incorrectOtpMultipleTime: boolean = false;
  isOpen: boolean = true;
  err422: boolean;
  signupForm: boolean = false;
  consentGiven: boolean = false;
  aadharnumber: string;
  btnenable: boolean;

  constructor(private http: HttpClient, public generalService: GeneralService, public router: Router,
    public translate: TranslateService) {
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

  //Check whether consent is provided or not
  checkValue(event:any){
    if(event.target.checked==true){
      this.consentGiven == true;
      this.btnenable ==true;
    }
    else{
      this.consentGiven == false;
    }
  }

  async verifyOtp(fieldKey) {
    this.fieldKey = fieldKey;

    this.aadharnumber = (<HTMLInputElement>document.getElementById(fieldKey)).value;

    if (this.aadharnumber && this.aadharnumber.length == 12) {
        
      let param = {
        aadhaar: this.aadharnumber,
      };
      this.http
        .post<any>(`${getDonorServiceHost()}/abha/registration/aadhaar/generateOtp`, param)
        .subscribe({
          next: (data) => {
            this.transactionId = data.txnId;
           // this.OtpPopup();
           
          },
          error: (error) => {
            //  (<HTMLInputElement>document.getElementById(fieldKey)).value = "";
           
            console.log(error);
          }
        });
    } else {
      // this.isNumberValid = false;
      // let dateSpan = document.getElementById('mobmessage');
      // dateSpan.classList.add('text-danger');
      // dateSpan.innerText = "Please enter valid mobile number";
      // document.getElementById('mobileno').classList.add('is-invalid');
    }
  }

  onItemChange(data) {
    this.selectedProfile = data;
    this.selected = true;
  }

  checkErrType(err) {

    this.errorMessage = err?.error['message'];
    if (this.errorMessage != undefined && this.errorMessage.includes('30')) {
      this.customErrCode = '422';
    } else if (this.errorMessage != undefined && this.errorMessage.includes('enter valid mobile')) {
      this.customErrCode = '427';
    } else {
      this.customErrCode = '';
    }

  }


  getProfile() {
    let param = {
      "healthId": this.selectedProfile.healthIdNumber,
      "transactionId": this.linkedAbhaList.txnId,
      "token": this.linkedAbhaList.token
    };

    this.http
      .post<any>(`${getDonorServiceHost()}/abha/profile`, param)
      .subscribe({
        next: (data) => {

          console.log(data);
          let dateSpan = document.getElementById('mobmessage');
          dateSpan.classList.remove('text-danger');
          dateSpan.innerText = "";
          document.getElementById('mobileno').classList.remove('is-invalid');
          (document.getElementById('mobileno') as any).disabled = true;

          this.dataObj = data;
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
            this.OtpPopup('canRegister');
            this.isVerify = false;
            (document.getElementById('mobileno') as any).disabled = false;
          } else {

            const healthIdNumber = this.dataObj.healthIdNumber.replaceAll('-', '');
            localStorage.setItem(healthIdNumber, JSON.stringify(this.dataObj));
            localStorage.setItem('form_value', JSON.stringify(this.dataObj));
            localStorage.setItem('isVerified', JSON.stringify(this.isVerify));
            //  document.getElementById('closeModalButton').click();
            this.closePops('verifyOtpPopup');
            setTimeout(() => {
              (document.getElementById('mobileno') as any).focus();
            }, 1000);
          }
        },
        error: (error) => {
          this.errorMessage = error?.error['message'];
          this.customErrCode = (error?.error['status']) ? error?.error['status'] : "";
          if (error?.error['status'] == '401') {
            this.err401 = true;
          }
          console.error('There was an error!', error);
        },
      });
  }


  submitOtp() {
    if (this.optVal) {
      let param = {
        txnId: this.transactionId,
        otp: this.optVal,
      };

      localStorage.setItem('isAutoFill', 'true');

      this.http
        .post<any>(`${getDonorServiceHost()}/abha/registration/aadhaar/verifyOtp`, param)
        .subscribe({
          next: (data) => {
            console.log(data);
            if(data?.txnId){
              console.log('call mobile pop up')
              this.mobilPopup();

            }else{
              console.log('auto populate')
            }
           

          },
          error: (error) => {

            // this.errorMessage = error?.error['message'];
            // this.customErrCode = (error?.error['status']) ? error?.error['status'] : "";
            // if (error?.error['status'] == '401') {
            //   this.err401 = true;
            // }

            console.error('There was an error!', error);
          },
        });
    }

    let clickCount = 0;
    const button = document.querySelector('#ifIncorrectOTP');
    button.addEventListener('click', () => {
      clickCount++;
      if (clickCount === 3) {
        this.incorrectOtpMultipleTime = true;
        this.closePops('verifyOtpPopup');
      }
    });
  }

  closeModal() {
    this.isOpen = false;
    const modalBackdrop = document.querySelector('.modal-backdrop.fade.show');
    if (modalBackdrop) {
      modalBackdrop.remove();
    }
    this.clearVal();
  }

  OtpPopup(id = "verifyOtpPopup") {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }

  mobilPopup(id = "mobilePopup") {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }
  selectProfile(id = 'selectProfileModel') {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }

  closePops(id) {
    let modal = document.getElementById(id);
    modal.style.display = 'none';
    modal.style.opacity = '0';
  }

  clearVal() {
    //  this.isVerify = false;
    window.location.reload();
    // (<HTMLInputElement>document.getElementById(this.fieldKey)).value = '';
  }
 
}