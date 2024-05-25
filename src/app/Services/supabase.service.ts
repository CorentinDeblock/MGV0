import { Injectable } from '@angular/core';
import {
    createClient,
    RealtimeChannel,
    RealtimePostgresChangesFilter,
    SupabaseClient
} from '@supabase/supabase-js'
import { environment } from "../../environments/environment"
import * as uuid from "uuid"

type DatabaseFilter = "*" | "INSERT" | "UPDATE" | "DELETE"

type OnReceiveCallback<Data> = (data?: Data) => void
type ListenerData<Filter extends { [key:string]: any}, Callback> = {
    callback: Callback
} & Filter
type PresenceFilter = "sync" | "leave" | "join"
type PresenceData = { key: string, presence: any } | undefined

type Listener<Data> = {
    "broadcast": ListenerData<{ event: string }, OnReceiveCallback<Data>>,
    "postgres_changes": ListenerData<RealtimePostgresChangesFilter<"*">, OnReceiveCallback<Data>>,
    "presence": ListenerData<{ event: PresenceFilter }, (data: PresenceData) => void>
}

class Channel<Data, Event extends string = string>
{
    private channel: RealtimeChannel

    constructor(channel: RealtimeChannel) {
        this.channel = channel
        this.on("presence", {
            event: "join",
            callback: () => {
                console.log("Someone has joined")
            }
        }).subscribe()
    }

    public send(event: Event, data?: Data) {
        return this.channel.send({
            event,
            type: "broadcast",
            payload: data
        });
    }

    public on<Type extends keyof Listener<Data> & string>(type: Type, payload: Listener<Data>[Type]) {
        return this.channel.on(type as any, payload, (data) => {
            payload.callback(data as any)
        })
    }
}


interface GameData
{
    id: number,
    boardIndex: number
}

class GameChannel extends Channel<GameData>
{
    public id: string;

    constructor(supabase: SupabaseClient, id: string = uuid.v4()) {
        super(supabase.channel(id))
        this.id = id
    }
}

class Game {
    private supabase : SupabaseClient

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase
    }

    createGame() {
        return new GameChannel(this.supabase)
    }

    joinGame(id: string) {
        return new GameChannel(this.supabase, id)
    }
}

@Injectable({
    providedIn: 'root',
})
export class SupabaseService {
    private supabase: SupabaseClient
  
    public Game: Game

    constructor() {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
      this.supabase.auth.signInAnonymously()
      this.Game = new Game(this.supabase)
    }
}