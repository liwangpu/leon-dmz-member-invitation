import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatBottomSheet, MatAutocompleteSelectedEvent, MatSnackBar, MatButton } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { environment } from "@env/environment";
import { map, tap, debounceTime, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

class NationalUrban {
  id: string;
  name: string;
  parentId: string;
  nationalUrbanType: string;
  children: Array<NationalUrban>;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  submiting = false;
  inviterId: string;
  inviterAvatar: string = '/assets/icons/cool-boy.jpg';
  inviterName: string = '管理员';
  provinceControl = new FormControl();
  cityControl = new FormControl();
  detailForm: FormGroup;
  proviceOptions: Observable<Array<NationalUrban>>;
  cityOptions: Array<NationalUrban> = [];
  allProvince: Array<NationalUrban> = [];
  refCities: Array<NationalUrban> = [];
  requestHeader = new HttpHeaders({ 'Content-Type': 'application/json' });
  @ViewChild('submitCt') submitCt: MatButton;
  constructor(protected formBuilder: FormBuilder, protected bottomSheet: MatBottomSheet, protected route: ActivatedRoute, protected httpClient: HttpClient, protected snackBar: MatSnackBar) {
    this.detailForm = this.formBuilder.group({
      inviter: ['', [Validators.required]],
      name: ['', [Validators.required]],
      mail: ['', [Validators.required, Validators.email]],
      company: [''],
      remark: ['', [Validators.maxLength(200)]],
      phone: ['', [Validators.required]],
      province: ['', [Validators.required]],
      city: ['', [Validators.required]]
    });
  }//constructor

  ngOnInit(): void {

    // //初始化数据,仅用测试
    // this.detailForm.patchValue({
    //   inviter: '9RC61V7NR9K569',
    //   name: '小明',
    //   mail: 'liwang.pu@gmail.com',
    //   phone: '15721457986',
    //   company: '淘宝'
    // });


    this.getProvince().pipe(map(res => res && res.data && res.data.length > 0 ? res.data : [])).pipe(tap(opts => this.allProvince = opts)).subscribe(provinces => {
      this.proviceOptions = of(provinces);
      //设置选中/改变值响应
      this.provinceControl.valueChanges.pipe(debounceTime(500))
        .pipe(map(x => (typeof x) === 'string' ? x : (x ? x.name : '')))
        .pipe(map(name => {
          let arr = name ? this.allProvince.filter(x => x.name.indexOf(name) > -1) : this.allProvince;
          return [name, arr];
        }))
        .subscribe(fus => {
          this.proviceOptions = of(fus[1]);
          let name = fus[0];
          //选中项后
          if (name == '' || !this.allProvince.some(x => x.name == name)) {
            this.changeUrban();
          }//if
        });//subscribe
    });//subscribe

    this.cityControl.valueChanges.pipe(debounceTime(500))
      .pipe(map(x => (typeof x) === 'string' ? x : (x ? x.name : '')))
      .pipe(map(name => {
        let arr = name ? this.refCities.filter(x => x.name.indexOf(name) > -1) : this.refCities;
        return [name, arr];
      })).subscribe(fus => {
        this.cityOptions = fus[1];
        let name = fus[0];
        //选中项后
        if (name == '' || !this.refCities.some(x => x.name == name)) {
          this.changeUrban();
        }//if
      });//subscribe

    //获取邀请人信息
    this.route.queryParams.pipe(map(parm => parm['u']))
      .subscribe(inviter => {
        if (!inviter) return;
        this.httpClient.get<{ id: string, name: string, icon: string }>(`${environment.serveBase}/Account/${inviter}`).subscribe(acc => {
          this.inviterId = inviter;
          this.detailForm.patchValue({ inviter: inviter });
          this.inviterName = acc.name ? acc.name : this.inviterName;
          this.inviterAvatar = acc.icon ? acc.icon : this.inviterAvatar;
        });//subscribe
      });//subscribe


  }//ngOnInit

  proviceDisplayFn(province?: NationalUrban): string | undefined {
    return province ? province.name : undefined;
  }//proviceDisplayFn

  cityDisplayFn(city?: NationalUrban): string | undefined {
    return city ? city.name : undefined;
  }//cityDisplayFn

  onProvinceSelect(evt: MatAutocompleteSelectedEvent) {
    let province = evt.option.value;
    this.getUbrnById(province.id).pipe(map(res => res && res.children ? res.children : []))
      .subscribe(arr => {
        this.refCities = arr;
        this.cityOptions = arr;
        let currentCity = this.cityControl.value;
        //city不属于该province
        if (currentCity && !arr.some(x => x.id == currentCity.id)) {
          this.cityControl.patchValue({});
        }//if
        this.detailForm.markAsDirty();
        this.changeUrban();
      });//subscribe
  }//onProvinceSelect

  onCitySelect(evt: MatAutocompleteSelectedEvent) {
    this.detailForm.markAsDirty();
    this.changeUrban();
  }//onCitySelect

  reset() {
    this.provinceControl.reset();
    this.cityControl.reset();
    this.detailForm.reset();
    this.detailForm.patchValue({ inviter: this.inviterId });
  }//reset

  submit() {
    this.submiting = true;
    this.submitCt.disabled = true;
    let data = this.detailForm.value;

    let submit$ = this.httpClient.post(`${environment.serveBase}/MemberRegistry`, data, { headers: this.requestHeader });

    submit$.pipe(map(() => "提交成功")).pipe(catchError(() => of('提交失败,请稍后再试'))).subscribe(msg => {
      this.submiting = false;
      this.submitCt.disabled = false;
      this.snackBar.open(msg, '', {
        duration: 2000,
      });
    });//subscribe
  }//submit

  changeUrban() {
    let province = this.provinceControl.value;
    let city = this.cityControl.value;
    let ubran = {
      province: province && province.id ? province.id : '',
      city: city && city.id ? city.id : '',
      county: ''
    };
    this.detailForm.patchValue(ubran);
  }//getUrban

  getProvince(name?: string) {
    return this.httpClient.get<{ data: Array<NationalUrban> }>(`${environment.serveBase}/NationalUrban?page=0&pageSize=999&search=${name ? name : ''}&nationalUrbanTypes=province`);
  }//queryUrban

  getUbrnById(id: string) {
    return this.httpClient.get<NationalUrban>(`${environment.serveBase}/NationalUrban/${id}`, { headers: this.requestHeader });
  }//getUbrnById

}
