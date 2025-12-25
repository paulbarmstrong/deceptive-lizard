import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi"
import * as z from "zod"
import { OptimusDdbClient } from "optimus-ddb-client"
import { Json, zodValidate } from "common"
import { ClientError, WsApiEvent } from "src/utilities/Types"

const bodyZod = z.strictObject({
	action: z.literal("update"),
	data: z.strictObject({
		playerName: z.optional(z.string())
	})
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

