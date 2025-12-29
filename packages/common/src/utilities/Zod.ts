import * as z from "zod"
import { NUM_TOPICS } from "./Constants"

export const dynamicWebappConfigZod = z.strictObject({
	httpApiEndpoint: z.string(),
	wsApiEndpoint: z.string()
})

export const lobbyIdZod = z.number().int().min(0).max(9999)

export const topicsArrayZod = z.array(z.string()).length(NUM_TOPICS)

export const playerNameZod = z.string().min(3)

export const playerZod = z.strictObject({
	connectionId: z.string(),
	name: playerNameZod,
	isDeceptiveLizard: z.optional(z.boolean()),
	topicHint: z.optional(z.string()),
	votePlayerIndex: z.optional(z.number().int().min(0))
})

export const lobbyZod = z.strictObject({
	id: lobbyIdZod,
	turnPlayerIndex: z.number().int().min(0),
	players: z.array(playerZod),
	category: z.optional(z.string()),
	topics: z.optional(topicsArrayZod),
	selectedTopicIndex: z.optional(z.number().int().min(0)),
	ttl: z.number().int()
})

export const gameEventTypeZod = z.union([
	z.literal("chat"), z.literal("join"), z.literal("leave"), z.literal("topic-hint"), z.literal("vote"), z.literal("round-end"),
	z.literal("round-reset"), z.literal("category")
])

export const gameEventZod = z.strictObject({
	lobbyId: lobbyIdZod,
	eventId: z.string().ulid(),
	type: gameEventTypeZod,
	playerName: playerNameZod,
	text: z.optional(z.string()),
	timestamp: z.string(),
	ttl: z.number().int()
})

export const wsUpdateRequestDataZod = z.strictObject({
	lobbyId: lobbyIdZod,
	playerName: z.optional(playerNameZod),
	category: z.optional(z.string().min(3).max(32)),
	topicHint: z.optional(z.string()),
	chatMessage: z.optional(z.string()),
	votePlayerIndex: z.optional(z.number().int().min(0)),
	clearVotePlayerIndex: z.optional(z.boolean())
})

export function zodValidate<T extends z.ZodTypeAny>(params: {
	schema: T,
	data: any,
	errorMapping?: (e: z.ZodError) => Error
}): z.infer<T> {
	try {
		params.schema.parse(params.data)
		return params.data
	} catch (error) {
		if (error instanceof z.ZodError && params.errorMapping !== undefined) {
			throw params.errorMapping(error)
		} else {
			throw error
		}
	}
}