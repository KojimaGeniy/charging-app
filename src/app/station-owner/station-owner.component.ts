import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { BaseService } from '../base.service';
import { IStation, IOperation, ITariff } from '../mock-data/models';
import { formatDate, onlyDigits } from "../../lib/lib";
import { RegisterService } from "../ethContr/register.service";
import { ERC20TokenService } from "../ethContr/erc20Token.service";

@Component({
  selector: 'app-station-owner',
  templateUrl: './station-owner.component.html',
  styleUrls: ['./station-owner.component.css']
})
export class StationOwnerComponent implements OnInit, AfterViewInit {
  user: string;
  balance: number;
  stations: IStation[] = [];
  tariffs: string[] = [];
  newStation: string = "";
  adding: boolean = false;
  addingTariff: boolean = false;
  editingStation: boolean = false;
  currentEditingStation: IStation;
  newTariffFrom: string = "00:00";
  newTariffTo: string = "00:00";
  newTariffPrice: number = 0;
  operations: IOperation[] = [];
  displayedColumns: string[] = ["date", "type", "data"];
  columnsHeaders: string[] = ["Дата", "Операция", "Детали"];

  @ViewChild('dtpfrom') dtpFrom: any;
  @ViewChild('dtpto') dtpTo: any;
  @ViewChild('priceInput') priceInput: any;


  constructor(
    private bs: BaseService,
    private rs: RegisterService,
    private e20ts: ERC20TokenService, 
    private sb: MatSnackBar
    ) {
      this.user = this.e20ts.getUser();
      this.getBalance();
      this.rs.showChargers()
        .then((stations: IStation[]) => {
          this.stations = stations;
        });
    }
    
    ngOnInit() {}
    
    ngAfterViewInit() {}
    
    getBalance() {
      this.e20ts.getBalance(this.user)
        .then((balance: number) => {
        this.balance = balance;
      });
    }
  
    buyTokens(amount: number) {
      this.e20ts.buyTokens(amount)
        .then((status: any) => {
          if (status) {
            this.sb.open("Покупка токенов", "Готово", {
              duration: 3000
            });
            this.getBalance();
          } else {
            this.sb.open("Покупка не удалась", "Ошибка", {
              duration: 3000
            })
          }
        });
      this.updateJournal();
    }
  
    saleTokens(amount: number) {
      this.sb.open("Продажа токенов", "Готово", {
        duration: 3000
      });
      this.updateJournal();
    }
    
    formatDate(date: Date) {
      return formatDate(date).string;
    }

  toggleAdding() {
    this.adding = !this.adding;
  }

  toggleAddingTariff() {
    this.addingTariff = !this.addingTariff;
    this.dtpFrom.resetTime();
    this.dtpTo.resetTime();
  }

  checkPriceInput(e: any) {
    return onlyDigits(e);
  }

  priceToNumber(e: any) {
    console.log(e);
    this.newTariffPrice *= 1;
    this.priceInput.nativeElement.value = this.newTariffPrice;
  }

  setFromTime(date: Date) {
    let hours = date.getHours() < 10 ? "0" + date.getHours() : String(date.getHours());
    let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : String(date.getMinutes());
    this.newTariffFrom = `${hours}:${minutes}`;
  }

  setToTime(date: Date) {
    let hours = date.getHours() < 10 ? "0" + date.getHours() : String(date.getHours());
    let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : String(date.getMinutes());
    this.newTariffTo = `${hours}:${minutes}`;
  }

  clearInputs() {
    this.addingTariff = false;
    this.newTariffFrom = "00:00";
    this.newTariffTo = "00:00";
    this.newTariffPrice = 0;
    this.dtpFrom.resetTime();
    this.dtpTo.resetTime();
    this.currentEditingStation = null;
    this.editingStation = false;
  }

  sortTariff(a: any, b: any) {
    if (`${a.from}${a.to}` > `${b.from}${b.to}`) return 1;
    else return -1;
  }

  addNewStation() {
    this.sb.open("Добавление станции", "Готово", {
      duration: 3000
    });
    this.updateJournal();
    this.toggleAdding();
  }

  validateNewStation() {
    return this.newStation.length > 0;
  }

  addNewTariff(address: string) {
    this.sb.open("Добавление тарифа", "Готово", {
      duration: 3000
    });
    this.updateJournal();
    this.newTariffFrom = "00:00";
    this.newTariffTo = "00:00";
    this.newTariffPrice = 0;
    this.addingTariff = !this.addingTariff;
  }

  setEditingStation(station: IStation) {
    this.currentEditingStation = Object.assign({ ...station });
    this.editingStation = true;
  }

  finishEditingStation() {
    this.currentEditingStation = null;
    this.editingStation = false;
  }

  editStation() {
    this.sb.open("Редактирование адреса станции", "Готово", {
      duration: 3000
    });
    this.finishEditingStation();
    this.updateJournal();
  }

  deleteStation(station: IStation) {
    this.sb.open("Удаление станции", "Готово", {
      duration: 3000
    });
    this.updateJournal();
  }

  deleteTariff(station: IStation, tariff: ITariff) {
    this.sb.open("Удаление тарифа", "Готово", {
      duration: 3000
    });
    this.updateJournal();
  }

  updateJournal() {
    // this.operations = this.bs.getUsersOperations(this.user.name).reverse();
  }
}
