#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { DeceptiveLizardStack } from "../lib/stacks/DeceptiveLizardStack"

const app = new cdk.App()

new DeceptiveLizardStack(app, "DeceptiveLizard")
