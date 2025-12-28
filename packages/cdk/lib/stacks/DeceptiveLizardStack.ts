import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambda_nodejs from "aws-cdk-lib/aws-lambda-nodejs"
import * as iam from "aws-cdk-lib/aws-iam"
import * as route53 from "aws-cdk-lib/aws-route53"
import * as route53_targets from "aws-cdk-lib/aws-route53-targets"
import * as acm from "aws-cdk-lib/aws-certificatemanager"
import * as apigw from "aws-cdk-lib/aws-apigatewayv2"
import * as apigwinteg from "aws-cdk-lib/aws-apigatewayv2-integrations"
import { AssetWithBuild, StaticWebsite } from "@paulbarmstrong/cdk-static-website-from-asset"
import { DynamicWebappConfig } from "common"

export class DeceptiveLizardStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		const HOSTED_ZONE_ID: string | undefined = process.env.HOSTED_ZONE_ID
		const HOSTED_ZONE_NAME: string | undefined = process.env.HOSTED_ZONE_NAME
		const DECEPTIVE_LIZARD_DOMAIN: string | undefined = process.env.DECEPTIVE_LIZARD_DOMAIN

		const hostedZone: route53.IHostedZone | undefined = HOSTED_ZONE_ID !== undefined ? (
			route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
				hostedZoneId: HOSTED_ZONE_ID!,
				zoneName: HOSTED_ZONE_NAME!
			})
		) : (
			undefined
		)

		const lobbiesTable = new dynamodb.Table(this, "LobbiesTable", {
			tableName: "DeceptiveLizardLobbies",
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
			timeToLiveAttribute: "ttl",
			removalPolicy: cdk.RemovalPolicy.DESTROY
		})

		const gameEventsTable = new dynamodb.Table(this, "GameEventsTable", {
			tableName: "DeceptiveLizardGameEvents",
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			partitionKey: { name: "lobbyId", type: dynamodb.AttributeType.NUMBER },
			sortKey: { name: "eventId", type: dynamodb.AttributeType.STRING },
			timeToLiveAttribute: "ttl",
			removalPolicy: cdk.RemovalPolicy.DESTROY
		})

		const httpApiFunction = new lambda_nodejs.NodejsFunction(this, "HttpApiFunction", {
			runtime: lambda.Runtime.NODEJS_24_X,
			entry: "../http-api/src/index.ts",
		})
		lobbiesTable.grantReadWriteData(httpApiFunction)
		gameEventsTable.grantReadWriteData(httpApiFunction)

		const httpApiCert: acm.Certificate | undefined = hostedZone !== undefined ? (
			new acm.Certificate(this, "HttpApiCert", {
				validation: acm.CertificateValidation.fromDns(hostedZone),
				domainName: `api.${DECEPTIVE_LIZARD_DOMAIN!}`
			})
		) : (
			undefined
		)

		const httpApiDomainName: apigw.DomainName | undefined = httpApiCert !== undefined ? (
			new apigw.DomainName(this, "HttpApiDomainName", {
				domainName: `api.${DECEPTIVE_LIZARD_DOMAIN!}`,
				certificate: httpApiCert
			})
		) : (
			undefined
		)

		const httpApi = new apigw.HttpApi(this, "HttpApi", {
			apiName: "DeceptiveLizardHttpApi",
			corsPreflight: {
				allowHeaders: [
					"Content-Type",
					"X-Amz-Date",
					"Authorization",
					"X-Api-Key",
					"X-Amz-Security-Token"
				],
				allowMethods: [
					apigw.CorsHttpMethod.GET,
					apigw.CorsHttpMethod.POST,
					apigw.CorsHttpMethod.OPTIONS
				],
				allowOrigins: ["*"]
			},
			defaultDomainMapping: httpApiDomainName !== undefined ? { domainName: httpApiDomainName } : undefined,
		})

		if (httpApiDomainName !== undefined) {
			const httpApiARecord = new route53.ARecord(this, "HttpApiARecord", {
				zone: hostedZone!,
				recordName: `api.${DECEPTIVE_LIZARD_DOMAIN!}`,
				target: route53.RecordTarget.fromAlias(new route53_targets.ApiGatewayv2DomainProperties(
					httpApiDomainName.regionalDomainName, httpApiDomainName.regionalHostedZoneId))
			})
		}
		
		httpApi.addRoutes({
			path: "/{api}",
			methods: [apigw.HttpMethod.GET, apigw.HttpMethod.POST],
			integration: new apigwinteg.HttpLambdaIntegration("HttpLambdaIntegration", httpApiFunction)
		})


		const wsApi = new apigw.WebSocketApi(this, "WsApi", {
			apiName: "DeceptiveLizardWsApi"
		})

		const wsApiFunction = new lambda_nodejs.NodejsFunction(this, "WsApiFunction", {
			runtime: lambda.Runtime.NODEJS_24_X,
			environment: {
				WEB_SOCKET_API_ENDPOINT: wsApi?.apiEndpoint
			},
			entry: "../ws-api/src/index.ts",
		})
		lobbiesTable.grantReadWriteData(wsApiFunction)
		gameEventsTable.grantReadWriteData(wsApiFunction)
		wsApiFunction.addToRolePolicy(new iam.PolicyStatement({
			actions: ["execute-api:ManageConnections"],
			resources: [`arn:aws:execute-api:${this.region}:${this.account}:${wsApi.apiId}/*`]
		}))

		const wsApiCert = (hostedZone !== undefined) ? (
			new acm.Certificate(this, "WsApiCert", {
				validation: acm.CertificateValidation.fromDns(hostedZone),
				domainName: `ws.${DECEPTIVE_LIZARD_DOMAIN}`
			})
		) : (
			undefined
		)
		
		const wsApiDomainName = (wsApiCert !== undefined) ? (
			new apigw.DomainName(this, "WsApiDomainName", {
				domainName: `ws.${DECEPTIVE_LIZARD_DOMAIN}`,
				certificate: wsApiCert
			})
		) : (
			undefined
		)

		const wsApiStage = new apigw.WebSocketStage(this, "WsApiStage", {
			webSocketApi: wsApi,
			stageName: "Prod",
			autoDeploy: true,
			domainMapping: wsApiDomainName !== undefined ? { domainName: wsApiDomainName } : undefined
		})

		if (hostedZone !== undefined && wsApiDomainName !== undefined) {
			const wsApiARecord = new route53.ARecord(this, "WsApiARecord", {
				zone: hostedZone,
				recordName: `ws.${DECEPTIVE_LIZARD_DOMAIN}`,
				target: route53.RecordTarget.fromAlias(new route53_targets.ApiGatewayv2DomainProperties(
					wsApiDomainName.regionalDomainName, wsApiDomainName.regionalHostedZoneId))
			})
		}

		const disconnectRoute = new apigw.WebSocketRoute(this, "DisconnectRoute", {
			webSocketApi: wsApi,
			routeKey: "$disconnect",
			integration: new apigwinteg.WebSocketLambdaIntegration("DisconnectInteg", wsApiFunction)
		})

		const useResourceRoute = new apigw.WebSocketRoute(this, "UpdateRoute", {
			webSocketApi: wsApi,
			routeKey: "update",
			integration: new apigwinteg.WebSocketLambdaIntegration("UpdateInteg", wsApiFunction)
		})

		const websiteAsset = new AssetWithBuild(this, "WebsiteAsset", {
			path: "../webapp",
			build: (exec, outputDir) => {
				exec("npx react-scripts build --color=always", {
					env: { BUILD_PATH: outputDir },
				})
				exec(`rm -f ${outputDir}/config.json`)
			},
			deployTime: true
		})
		
		const httpApiEndpoint: string = hostedZone !== undefined ? `https://api.${DECEPTIVE_LIZARD_DOMAIN}` : httpApi.apiEndpoint
		const wsApiEndpoint: string = hostedZone !== undefined ? `wss://ws.${DECEPTIVE_LIZARD_DOMAIN}` : wsApi.apiEndpoint

		const website = new StaticWebsite(this, "Website", {
			asset: websiteAsset,
			domains: hostedZone !== undefined ? [{domainName: DECEPTIVE_LIZARD_DOMAIN!, hostedZone}] : []
		})
		const dynamicWebappConfig: DynamicWebappConfig = {
			httpApiEndpoint,
			wsApiEndpoint
		}
		website.addObject({
			key: "config.json",
			body: JSON.stringify(dynamicWebappConfig)
		})

		new cdk.CfnOutput(this, "HttpApiEndpoint", {
			value: httpApiEndpoint
		})

		new cdk.CfnOutput(this, "WsApiEndpoint", {
			value: wsApiEndpoint
		})

		new cdk.CfnOutput(this, "WebsiteUrl", {
			value: `https://${website.distribution.domainName}`
		})
	}
}