import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi"
import * as z from "zod"
import { OptimusDdbClient } from "optimus-ddb-client"
import { Json, WsApiEvent, zodValidate } from "common"
import { ClientError } from "src/utilities/Ws"

const bodyZod = z.strictObject({
	type: z.literal("connect"),
	name: z.string()
})

export default async function(event: WsApiEvent, optimus: OptimusDdbClient, apiGatewayManagementClient: ApiGatewayManagementApiClient)
		: Promise<Json> {
	const body = zodValidate({
		data: event.body,
		schema: bodyZod,
		errorMapping: e => new ClientError(e.message)
	})

	console.log(`${event.connectionId} updated`)

	return undefined
}

