import * as z from "zod"

export const dynamicWebappConfigZod = z.strictObject({
	httpApiEndpoint: z.string(),
	wsApiEndpoint: z.string()
})

export const lobbyIdZod = z.number().int().min(0).max(9999)

export const playerZod = z.strictObject({
	connectionId: z.string(),
	name: z.string(),
	isDeceptiveLizard: z.optional(z.boolean()),
	topicHint: z.optional(z.string()),
	votePlayerIndex: z.optional(z.number().int().min(0))
})

export const lobbyZod = z.strictObject({
	id: lobbyIdZod,
	turnPlayerIndex: z.number().int().min(0),
	players: z.array(playerZod),
	category: z.optional(z.string()),
	topics: z.array(z.string()),
	selectedTopicIndex: z.optional(z.number().int().min(0)),
	ttl: z.number().int()
})
//	.refine(lobby => lobby.turnPlayerIndex < lobby.players.length || lobby.players.length === 0)
// 	.refine(lobby => lobby.players.map(player => (player.votePlayerIndex ?? 0) < lobby.players.length))

export const deceptiveLizardEventZod = z.strictObject({
	eventId: z.string(),
	type: z.literal("chat-message"),
	user: z.string(),
	text: z.string(),
	timestamp: z.string()
})

export const wsUpdateRequestDataZod = z.strictObject({
	lobbyId: lobbyIdZod,
	playerName: z.optional(z.string()),
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