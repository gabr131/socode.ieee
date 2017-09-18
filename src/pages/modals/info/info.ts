import { Component } from '@angular/core';
import { Platform, ViewController } from 'ionic-angular';

@Component({
  selector: 'modal-info',
  templateUrl: 'info.html'
})
export class ModalInfo {
  constructor(
    public platform: Platform,
    public viewCtrl: ViewController
  ) {}
  dismiss() {
    this.viewCtrl.dismiss();
  }
}