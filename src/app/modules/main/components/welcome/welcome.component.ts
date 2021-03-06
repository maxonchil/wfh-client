import {Component, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {ModalJoinRoomComponent} from '../modal-join-room/modal-join-room.component';
import {SocketService} from '../../../game/services/socket.service';
import {DataStoreService} from '../../../../core/services/data-store.service';

@Component({
  selector: 'app-home',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnDestroy {
  public roomCode: string;

  private notifier = new Subject();

  public fillColor: string = "#fcfbf9";
  public strokeColor: string = "#d5f9f6";

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private socketService: SocketService,
    private dataStore: DataStoreService
  ) {
  }

  public openDialog(): void {
    const dialogRef = this.dialog.open(ModalJoinRoomComponent, {panelClass: 'custom-dialog'});
    dialogRef.afterClosed()
      .pipe(takeUntil(this.notifier))
      .subscribe((result) => {
        console.log('The dialog was closed');
      });
  }

  public createRoom(): void {
    this.roomCode = this.generateRoomCode(4);
    console.log(this.roomCode);
    this.dataStore.setRoomCode(this.roomCode);
    this.socketService.emit('create-room', {username: this.dataStore.getUserName(), code: this.roomCode});
    this.router.navigate(['game/lobby', this.roomCode]);
  }

  // Generates room of length <codeLength> (must be an even number),
  // that consists of [0-9a-z]
  private generateRoomCode(codeLength): string {
    const dec2alphanum = (dec) => (`0${dec.toString(36)}`).substr(-2);

    const arr = new Uint8Array((codeLength + 1) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2alphanum).join('');
  }

  ngOnDestroy(): void {
    this.notifier.next();
    this.notifier.complete();
  }
}
