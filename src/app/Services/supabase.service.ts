import { inject, Injectable, NgZone } from '@angular/core';
import {
  createClient,
  RealtimeChannel,
  RealtimePostgresChangesFilter,
  RealtimePresenceJoinPayload,
  RealtimePresenceLeavePayload,
  SupabaseClient,
} from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import * as uuid from 'uuid';
import { Pion } from '../Models/pion';
import { SelectedPionInfo } from '../Component/game-page/game-page.component';

interface Template {
  event: {
    [key: string]: (...args: any) => void;
  };
}

class Channel<TemplateDef extends Template> {
  private channel: RealtimeChannel;

  constructor(channel: RealtimeChannel) {
    this.channel = channel;
    this.channel.subscribe();
  }

  public send<EventData extends keyof TemplateDef['event']>(
    event: EventData,
    ...data: Parameters<TemplateDef['event'][EventData]>
  ) {
    return this.channel.send({
      event: event as any,
      type: 'broadcast',
      payload: data,
    });
  }

  public on<EventData extends keyof TemplateDef['event']>(
    event: EventData,
    callback: (...args: Parameters<TemplateDef['event'][EventData]>) => void
  ) {
    return this.channel.on(
      'broadcast',
      { event: event as string },
      (data: Payload<Parameters<TemplateDef['event'][EventData]>>) => {
        callback(...data.payload);
      }
    );
  }

  public onJoin(
    callback: (
      payload: RealtimePresenceJoinPayload<{ [key: string]: any }>
    ) => void
  ) {
    return this.channel.on('presence', { event: 'join' }, callback);
  }

  public onLeave(
    callback: (
      payload: RealtimePresenceLeavePayload<{ [key: string]: any }>
    ) => void
  ) {
    return this.channel.on('presence', { event: 'leave' }, callback);
  }

  public onSync(callback: () => void) {
    return this.channel.on('presence', { event: 'sync' }, callback);
  }
}

interface GameData {
  boardIndex: number;
}

interface Payload<T> {
  payload: T;
  event: string;
  type: string;
}

export interface GameEventDef extends Template {
  event: {
    'request-map': () => void;
    'respond-map': (data: GameData) => void;
    'move-pawn': (row: number, col: number, pawn: SelectedPionInfo) => void;
  };
}

export class GameChannel extends Channel<GameEventDef> {
  public id: string;

  constructor(supabase: SupabaseClient, id: string = uuid.v4()) {
    super(supabase.channel(id));
    this.id = id;
  }
}

class Game {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  createGame() {
    return new GameChannel(this.supabase);
  }

  joinGame(id: string) {
    return new GameChannel(this.supabase, id);
  }
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly ngZone = inject(NgZone);

  public Game: Game;

  constructor() {
    this.supabase = this.ngZone.runOutsideAngular(() =>
      createClient(environment.supabaseUrl, environment.supabaseKey)
    );
    this.Game = new Game(this.supabase);
  }

  createChannel<TemplateDef extends Template>(name: string) {
    return new Channel<TemplateDef>(this.supabase.channel(name));
  }

  createChannelFromTemplate<
    ChannelTemplate extends Channel<TemplateDef>,
    TemplateDef extends Template
  >(
    ctor: new (supabaseClient: SupabaseClient) => ChannelTemplate
  ): ChannelTemplate {
    return new ctor(this.supabase);
  }
}
