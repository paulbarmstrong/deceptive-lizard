import * as z from "zod"
import { deceptiveLizardEventZod, dynamicWebappConfigZod } from "./Zod"

export type Json = undefined | null | string | number | boolean | Array<Json> | JsonObject

export type JsonObject = {
	[name: string]: Json
}

export type DynamicWebappConfig = z.infer<typeof dynamicWebappConfigZod>

export type DeceptiveLizardEvent = z.infer<typeof deceptiveLizardEventZod>

export type WebSocketRes = {
	event: DeceptiveLizardEvent
}