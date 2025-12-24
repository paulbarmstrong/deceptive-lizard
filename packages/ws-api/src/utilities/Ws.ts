import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi"
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda"
import { Json, WsApiEvent } from "common"

export class WsResolver {
	apiGatewayManagementApiClient: ApiGatewayManagementApiClient
	constructor(args: {
		wsApiEndpoint: string
	}) {
		this.apiGatewayManagementApiClient = new ApiGatewayManagementApiClient({
			endpoint: `${args.wsApiEndpoint.replace("wss://", "https://")}/Prod`
		})
	}
	
	translateForWs(handleEvent: (event: WsApiEvent) => Promise<Json>): (event: APIGatewayEvent) => Promise<APIGatewayProxyResult> {
		return async (apiGwEvent: APIGatewayEvent) => {
			const body: any = (() => {
				try {
					JSON.parse(apiGwEvent.body!)
				} catch (error) {
					return undefined
				}
			})()
			let response: string | undefined = undefined
			let serverError: boolean = false
			try {
				const wsApiEvent: WsApiEvent = {
					requestId: apiGwEvent.requestContext.requestId,
					routeKey: apiGwEvent.requestContext.routeKey!,
					connectionId: apiGwEvent.requestContext.connectionId!,
					body: body
				}
				const resObject = await handleEvent(wsApiEvent)
				if (resObject !== undefined) response = JSON.stringify(resObject)
			} catch (error) {
				if (error instanceof ClientError) {
					response = JSON.stringify({ error: {
						message: error.message,
						statusCode: error.statusCode
					}})
				} else {
					console.error(`${apiGwEvent.requestContext.requestId} | Unhandled error: ${(error as Error).stack}`)
					serverError = true
					response =  JSON.stringify({ error: {
						message: "Internal Server Error",
						statusCode: 500
					}})
				}
			}
			console.log(`${apiGwEvent.requestContext.requestId} | Request ended: ${JSON.stringify({
				connectionId: apiGwEvent.requestContext.connectionId,
				routeKey: apiGwEvent.requestContext.routeKey,
				body: body,
				response: response
			})}`)
			if (response !== undefined) {
				try {
					await this.apiGatewayManagementApiClient.send(new PostToConnectionCommand({
						ConnectionId: apiGwEvent.requestContext.connectionId,
						Data: response
					}))
				} catch (error) {
					console.error(`${apiGwEvent.requestContext.requestId} | Failed to send response: ${error}\n${(error as Error).stack}`)
				}
			}
			return { statusCode: 200, body: "success" }
		}
	}
}

export class ClientError extends Error {
	name = "ClientError"
	statusCode: number
	constructor(message: string, statusCode: number = 400) {
		super(message)
		this.statusCode = statusCode
	}
}
