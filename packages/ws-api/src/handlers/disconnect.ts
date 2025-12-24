import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi"
import { ItemNotFoundError, OptimusDdbClient } from "optimus-ddb-client"
import { Json, WsApiEvent } from "common"

export default async function(event: WsApiEvent, optimus: OptimusDdbClient, apiGatewayManagementClient: ApiGatewayManagementApiClient)
		: Promise<Json> {

	console.log(`${event.connectionId} disconnected`)

	return undefined
}
