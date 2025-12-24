import update from "./handlers/update"
import disconnect from "src/handlers/disconnect"
import { OptimusDdbClient } from "optimus-ddb-client"
import { ClientError, WsResolver } from "./utilities/Ws"

const wsResolver = new WsResolver({
	wsApiEndpoint: process.env.WEB_SOCKET_API_ENDPOINT!
})

const optimus: OptimusDdbClient = new OptimusDdbClient()
export const handler = wsResolver.translateForWs(async (event) => {
	if (event.routeKey === "update") return await update(event, optimus, wsResolver.apiGatewayManagementApiClient)
	if (event.routeKey === "$disconnect") return await disconnect(event, optimus, wsResolver.apiGatewayManagementApiClient)
	throw new ClientError("Invalid request format.")
})
