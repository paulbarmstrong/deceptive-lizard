import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi"
import { Lobby, lobbyZod, WsResponse } from "common"
import { Table } from "optimus-ddb-client"

export const lobbiesTable = new Table({
	tableName: "DeceptiveLizardLobbies",
	itemSchema: lobbyZod,
	partitionKey: "id"
})


export async function sendWsResponse(lobby: Lobby, res: WsResponse, apiGatewayManagementClient: ApiGatewayManagementApiClient) {
	try {
		await Promise.all(lobby.players.map(async player => {
			try {
				await apiGatewayManagementClient.send(new PostToConnectionCommand({
					ConnectionId: player.connectionId,
					Data: JSON.stringify(res)
				}))
			} catch (error) {
				if ((error as Error).name !== "GoneException") throw error
			}
		}))
	} catch (error) {
		console.error(`Error updating resource connections: ${error}\n${(error as Error).stack}`)
	}
}
