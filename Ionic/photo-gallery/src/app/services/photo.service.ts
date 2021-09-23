import { Injectable } from '@angular/core';
import {Camera, CameraResultType, CameraSource, Photo} from '@capacitor/camera';
import {Filesystem, Directory} from '@capacitor/filesystem'
import {Storage} from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: GalleryPhoto[] = [];
  private PHOTO_STORAGE: string = "photos";

  private async savePicture(cameraPhoto: Photo) {
    const base64Data = await this.readAsBase64(cameraPhoto);

    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Data
    });
    return {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath
      }
   }
   private async readAsBase64(cameraPhoto: Photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
   }
   convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
    resolve(reader.result);
    };
    reader.readAsDataURL(blob);
   });

  constructor() { }
  public async addNewToGallery() {
    
    const capturedPhoto = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    quality: 100
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
 this.photos.unshift(savedImageFile);

  Storage.set({
    key: this.PHOTO_STORAGE,
    value: JSON.stringify(this.photos)
   });
  }
   public async loadSaved() {
    // Retrieve cached photo array data
    const photos = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(photos.value) || [];
    
    // Display the photo by reading into base64 format
  for (let photo of this.photos) {
  // Read each saved photo's data from the Filesystem
    const readFile = await Filesystem.readFile({
    path: photo.filepath,
    directory: Directory.Data
    });
  // Web platform only: Load the photo as base64 data
    photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    } 
   }
   
}
interface GalleryPhoto {
  filepath: string;
  webviewPath: string;
 }