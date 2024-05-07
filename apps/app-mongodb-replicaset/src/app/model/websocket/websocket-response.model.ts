import { WsUser } from "./ws-user.model";

export interface WebsocketResponse<T> {

  message: string;
  success: boolean;
  broadcast: boolean;
  send_from: WsUser;
  data: T;

}