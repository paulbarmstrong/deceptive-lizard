import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi"
import * as z from "zod"
import { OptimusDdbClient } from "optimus-ddb-client"
import { GameEvent, Json, NUM_TOPICS, Player, topicsArrayZod, wsUpdateRequestDataZod, zodValidate } from "common"
import { ClientError, WsApiEvent } from "src/utilities/Types"
import { draftGameEvent, lobbiesTable, resetRound, sendWsResponse, updateLobbyTtl } from "src/utilities/Misc"
import { countBy } from "lodash"
import { askNova } from "src/utilities/Nova"

const bodyZod = z.strictObject({
	action: z.literal("update"),
	data: wsUpdateRequestDataZod
})

export default async function(event: WsApiEvent, optimus: OptimusDdbClient, apiGatewayManagementClient: ApiGatewayManagementApiClient)
		: Promise<Json> {
	const body = zodValidate({
		data: event.body,
		schema: bodyZod,
		errorMapping: e => new ClientError(e.message)
	})

	const gameEvents: Array<GameEvent> = []

	const lobby = await optimus.getItem({
		table: lobbiesTable,
		key: {id: body.data.lobbyId},
		itemNotFoundErrorOverride: e => new ClientError("Not found")
	})

	const existingPlayer: Player | undefined = lobby.players.find(player => player.connectionId === event.connectionId)

	const player: Player = existingPlayer ?? (() => {
		if (body.data.playerName === undefined) {
			throw new ClientError("New player must provide playerName")
		}
		const newPlayer: Player = {
			connectionId: event.connectionId,
			name: body.data.playerName,
			isDeceptiveLizard: false
		}
		lobby.players.push(newPlayer)

		gameEvents.push(draftGameEvent(optimus, {
			lobbyId: lobby.id,
			type: "join",
			playerName: body.data.playerName
		}))

		resetRound(optimus, lobby, gameEvents)

		return newPlayer
	})()

	if (body.data.category !== undefined) {
		if (lobby.players.indexOf(player) !== 0) throw new ClientError("You are not the round leader")
		if (lobby.category !== undefined) throw new ClientError("Category was already chosen")
		lobby.category = body.data.category
		const novaAnswer: string = await askNova(`Please think of the ${NUM_TOPICS} most well known specific subjects within the category "${body.data.category}".
			If the category is something inappropriate then please don't return anything.
			Please be sure to capitalize proper nouns.
			Please output it as a JSON array of strings.
			Please output only the JSON array, with no backticks and no json label.`)
		lobby.topics = zodValidate({data: JSON.parse(novaAnswer), schema: topicsArrayZod})
		lobby.selectedTopicIndex = Math.floor(Math.random() * NUM_TOPICS)
		const deceptiveLizardPlayerIndex = Math.floor(Math.random() * lobby.players.length)
		lobby.players.forEach((player, playerIndex) => player.isDeceptiveLizard = playerIndex === deceptiveLizardPlayerIndex)

		gameEvents.push(draftGameEvent(optimus, {
			lobbyId: lobby.id,
			type: "category",
			playerName: player.name,
			text: body.data.category
		}))
	}

	if (body.data.resetRound !== undefined) {
		if (lobby.players.indexOf(player) !== 0) throw new ClientError("You are not the round leader")
		resetRound(optimus, lobby, gameEvents, false)

		gameEvents.push(draftGameEvent(optimus, {
			lobbyId: lobby.id,
			type: "round-reset",
			playerName: player.name
		}))
	}

	if (body.data.topicHint !== undefined) {
		player!.topicHint = body.data.topicHint

		gameEvents.push(draftGameEvent(optimus, {
			lobbyId: lobby.id,
			type: "topic-hint",
			playerName: player.name,
			text: body.data.topicHint
		}))
	}

	if (body.data.chatMessage !== undefined) {
		gameEvents.push(draftGameEvent(optimus, {
			lobbyId: lobby.id,
			type: "chat",
			playerName: player.name,
			text: body.data.chatMessage
		}))
	}

	if (body.data.votePlayerIndex !== undefined || body.data.clearVotePlayerIndex === true) {
		player!.votePlayerIndex = (body.data.clearVotePlayerIndex === true) ? undefined : body.data.votePlayerIndex
		if (player!.votePlayerIndex !== undefined && (player.votePlayerIndex < 0 || player.votePlayerIndex >= lobby.players.length)) {
			throw new ClientError("Voted player does not exist")
		}

		gameEvents.push(draftGameEvent(optimus, {
			lobbyId: lobby.id,
			type: "vote",
			playerName: player.name,
			text: body.data.votePlayerIndex !== undefined ? lobby.players[body.data.votePlayerIndex].name : undefined
		}))

		if (lobby.players.find(player => player.votePlayerIndex === undefined) === undefined) {
			const voteFreqs = Object.entries(countBy(lobby.players.map(x => x.votePlayerIndex)))
				.map(pair => ({playerIndex: parseInt(pair[0]), freq: pair[1]})).sort((a,b) => b.freq - a.freq)
			if (voteFreqs.length === 1 || voteFreqs[0].freq !== voteFreqs[1].freq) {
				gameEvents.push(draftGameEvent(optimus, {
					lobbyId: lobby.id,
					type: "round-end",
					playerName: player.name,
					text: lobby.players[voteFreqs[0].playerIndex].name
				}))
				resetRound(optimus, lobby, gameEvents)
			}
		}
	}

	await optimus.commitItems({items: [updateLobbyTtl(lobby), ...gameEvents]})

	await sendWsResponse(lobby, {lobby}, apiGatewayManagementClient)
	for (const gameEvent of gameEvents) {
		await sendWsResponse(lobby, {gameEvent}, apiGatewayManagementClient)
	}

	return (existingPlayer === undefined) ? {connectionId: event.connectionId} : undefined
}
