

export type WsApiEvent = {
	requestId: string,
	routeKey: string,
	connectionId: string,
	body: {action: "update" | "$disconnect", data: Record<string, any>}
}

export class ClientError extends Error {
	name = "ClientError"
	statusCode: number
	constructor(message: string, statusCode: number = 400) {
		super(message)
		this.statusCode = statusCode
	}
}
