import * as z from "zod"
import { deceptiveLizardEventZod, dynamicWebappConfigZod, lobbyZod, wsUpdateRequestDataZod } from "./Zod"

export type Json = undefined | null | string | number | boolean | Array<Json> | JsonObject

export type JsonObject = {
	[name: string]: Json
}

export type DynamicWebappConfig = z.infer<typeof dynamicWebappConfigZod>

export type Lobby = z.infer<typeof lobbyZod>

export type DeceptiveLizardEvent = z.infer<typeof deceptiveLizardEventZod>

export type WsUpdateRequestData = z.infer<typeof wsUpdateRequestDataZod>

export type WsResponse = {
	event?: DeceptiveLizardEvent,
	lobby?: Lobby
}