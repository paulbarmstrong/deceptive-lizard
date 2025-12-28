import * as z from "zod"
import { dynamicWebappConfigZod, gameEventTypeZod, gameEventZod, lobbyZod, playerZod, wsUpdateRequestDataZod } from "./Zod"

export type Json = undefined | null | string | number | boolean | Array<Json> | JsonObject

export type JsonObject = {
	[name: string]: Json
}

export type DynamicWebappConfig = z.infer<typeof dynamicWebappConfigZod>

export type Player = z.infer<typeof playerZod>

export type Lobby = z.infer<typeof lobbyZod>

export type GameEventType = z.infer<typeof gameEventTypeZod>

export type GameEvent = z.infer<typeof gameEventZod>

export type WsUpdateRequestData = z.infer<typeof wsUpdateRequestDataZod>

export type WsResponse = {
	gameEvent?: GameEvent,
	lobby?: Lobby,
	connectionId?: string
}