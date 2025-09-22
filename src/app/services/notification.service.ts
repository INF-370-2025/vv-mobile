import { Injectable } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  private async presentToast(message: string, color: string, header?: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      header: header
    });
    await toast.present();
  }

  public showError(message: string, title?: string): void {
    this.presentToast(message, 'danger', title || 'Error');
  }

  public showSuccess(message: string, title?: string): void {
    this.presentToast(message, 'success', title || 'Success');
  }

  public showWarning(message: string, title?: string): void {
    this.presentToast(message, 'warning', title || 'Warning');
  }

  public showInfo(message: string, title?: string): void {
    this.presentToast(message, 'medium', title || 'Info');
  }

  public async showConfirm(header: string, message: string, confirmText: string = 'Confirm', cancelText: string = 'Cancel'): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: confirmText,
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }
}
