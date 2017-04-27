import { Component, OnInit, Input, Output, EventEmitter, Pipe, PipeTransform } from '@angular/core';

import { AlmanacService } from "./almanac.service";

export class Day {
    isToday: boolean;
    sYear: number;
    sMonth: number;
    sDay: number;
    week: string;
    lYear: number;
    lMonth: number;
    lDay: number;
    isLeap: boolean;
    cYear: string;
    cMonth: string;
    cDay: string;
    color: any;
    lunarFestival: string;
    solarFestival: string;
    solarTerms: string;
    sgz5: number;
    sgz3: string;
}

@Component({
    selector: 'almanac-ng2',
    template: `
        <div class="almanac">
            <div class="header">
                <a href="javascript:void(0);" (click)="minusMonth()"><i class="iconfont icon-rilifanye1"></i></a>
                <div>{{year}}年{{month+1}}月</div>
                <a href="javascript:void(0);" (click)="plusMonth()"><i class="iconfont icon-rilifanye"></i></a>
            </div>
            <div class="content">
                <section class="body">
                    <row-ng2></row-ng2>
                    <row-ng2 [week]="week" *ngFor="let week of _month" (dayClick)="onDayClick($event)"></row-ng2>
                </section>
            </div>
            <div class="footer">{{!_chooseDay.cYear?'':_chooseDay.cYear+"年"}}{{!_chooseDay.cMonth?'':_chooseDay.cMonth+"月"}}{{!_chooseDay.cDay?'':_chooseDay.cDay+"日"}}  {{_chooseDay.lunarFestival||''+" "+(_chooseDay.solarFestival||'')}}</div>
        </div>
        `,
    styles: [`
        .almanac {
            display:flex;
            flex-direction:column;
            flex-wrap:nowrap;
            min-width:600px;
        }
        .header {
            display:flex;
            align-items:center;
            justify-content:center;
            height:2rem;
        }
        .header>a{
            text-decoration:none;
        }
        .header>div{
            text-align:center;
            font-size:1.2rem;
            width:8rem;
        }
        .content {
            display:flex;
        }
        .body {
            flex:3;
            flex-direction:column;
        }
        .day-detail{
        }
        .footer {
            display:flex;
            align-items:center;
            justify-content:center;
            min-height:2rem;
        }
    `],
})
export class AlmanacComponent implements OnInit {

    private _blockDay:Day = new Day();

    private _chooseDay:Day = new Day();

    private _week: Array<Day> = new Array<Day>();
    private _month: Array<Array<Day>> = [];
    private _curMonth: Object;
    private _beforeMonth: Object;
    private _afterMonth: Object;
    private _monthArray:Array<Object> = []

    private _disabledColor:string = 'gry';

    @Input()
    year: number = 2015;
    @Input()
    month: number = 6;

    @Output()
    cldClick:EventEmitter<any> = new EventEmitter<any>();

    constructor(private _almanacService: AlmanacService) {
    }

    ngOnInit() {
        this._curMonth = this._almanacService.getCalendar(this.year, this.month);
        this._chooseDay = this._curMonth['0'];
        let curMonthLength = this._curMonth['length'];
        for(let idx=0;idx<this._curMonth['firstWeek'];idx++){
            this._week.push(this._blockDay);
        }
        for (let idx=0;idx<curMonthLength;idx++) {
            let curDay: Day = this._curMonth[idx];
            if(curDay.week==="六"||curDay.week==="日"){
                curDay.color="red";
            }
            this._week.push(curDay);
            if (curDay.week === "六") {
                this._month.push(this._week);
                this._week = [];
            }
        }
        let lastWeekLength = this._week.length;
        for(let idx=0;idx<7-lastWeekLength;idx++){
            this._week.push(this._blockDay);
        }
        this._month.push(this._week);
        this._week = [];
    }

    minusMonth(){
        this._month = [];
        if (this.month === 0) {
            this.year--;
            this.month = 11;
        }else{
            this.month--;
        }
        this.ngOnInit();
    }

    plusMonth(){
        this._month = [];
        if(this.month === 11){
            this.year++;
            this.month=0;
        }else{
            this.month++;
        }
        this.ngOnInit();
    }

    onDayClick(event:Day){
        this._chooseDay = event;
        this.cldClick.emit(event);
    }
}

@Component({
    selector: 'row-ng2',
    template: `
        <div class="row" *ngIf="!_week">
            <div class="col" *ngFor="let title of _titles">
                {{title}}
            </div>
        </div>
        <div class="row" *ngIf="_week">
            <div class="col" *ngFor="let day of _week" (click)="onColClick(day)" [style.color]="day.color">
                <div class="sday">{{day.sDay}}</div>
                <div class="lday" *ngIf="day.sDay">{{showLunar(day)|customslice}}</div>
            </div>
        </div>
        `,
    styles: [`
        .row {
            display:flex;
            flex-wrap:nowrap;
        }
        .col {
            display:flex;
            flex:1;
            min-height:1.6rem;
            border:1px solid lightgray;
            align-items:center;
            justify-content:center;
            cursor:hand;
            flex-direction:column;
            padding:10px;
        },
        .sday {
            font-size:2rem;
            min-height:2rem;
            line-height:2rem;
            height:2rem;
        }
        .lday {
            font-size:1rem;
        }
    `]
})
export class AlmanacRowComponent implements OnInit {

    private _week: Array<Day>;
    private _titles: Array<string> = ["星期日","星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

    @Output()
    weekInit: EventEmitter<any> = new EventEmitter();

    @Output()
    dayClick: EventEmitter<Day> = new EventEmitter<Day>();

    @Input('week')
    set week(w: Array<Day>) {
        this._week = w;
        this.weekInit.emit(w);
    }

    get week() {
        return this._week;
    }

    constructor(private _almanacService: AlmanacService) { }

    ngOnInit() { }

    onColClick(event:Day) {
        this.dayClick.emit(event);
    }

    showLunar(day:Day){
        let retDay:string="";
        if(day.solarTerms){
            return day.solarTerms;
        }
        if(day.lunarFestival || day.solarFestival){
            return `${day.lunarFestival||''} ${day.solarFestival||''}`
        }
        if(day.lDay===1){
            if(day.isLeap){
                retDay = "闰";
            }
            retDay += this._almanacService.formatLunarMonth(day.lMonth);
        }else{
            retDay=this._almanacService.formatLunarDay(day.lDay);
        }
        return retDay;
    }
}

@Component({
    selector: 'day-detail-ng2',
    template:`
        <div class="day-detail">
            <div class="hd">asdf</div>
            <div class="bd">asdf</div>
            <div class="ft">asdf</div>
        </div>
    `,
    styles: [`
        .day-detail{
            display:flex;
            flex-direction:column;
        }
    `]
})
export class AlmanacDayComponent implements OnInit {
    private _day:Day;

    public dayInit:EventEmitter<Day> = new EventEmitter<Day>();

    @Input('day')
    set day(d:Day){
        this._day = d;
        this.dayInit.emit(d);
    }

    get day(){
        return this._day;
    }

    constructor(private _almanacService:AlmanacComponent) { }

    ngOnInit() { }
}



@Pipe({name: 'customslice'})
export class CustomSlicePipe implements PipeTransform {
    transform(value: string): any {
        if(value.length<8) return value;
        return value.slice(0,7)+'...';
    }
}
