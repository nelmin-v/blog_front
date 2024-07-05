import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpMethod, HttpSenderService} from "app/core/service/base/http-sender.service";

export interface UploadResponse {
  success: boolean;
  uuid: string;
}

export class GetFile {
  type: string = '';
  nickname: string = '';
  uuid: string = '';

  constructor(type: string = '', nickname: string = '', uuid: string = '') {
    this.type = type;
    this.nickname = nickname;
    this.uuid = uuid;
  }
}

@Injectable({
  providedIn: 'any'
})
export class StorageService {

  constructor(private httpSender: HttpSenderService) {
  }

  upload(file: File, type: string = ''): Observable<UploadResponse> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('type', type);

    return this.httpSender.send(
      HttpMethod.POST,
      '/storage/upload',
      formData);
  }

  download(req: GetFile): Observable<File> {
    return this.httpSender.download(
      '/storage/download?type=' + req.type + '&nickname=' + req.nickname + '&uuid=' + req.uuid);
  }
}
