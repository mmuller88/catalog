import { Construct, Duration } from "@aws-cdk/core";
import sqs = require('@aws-cdk/aws-sqs');
import lambda = require('@aws-cdk/aws-lambda');
import events = require('@aws-cdk/aws-events');
import targets = require('@aws-cdk/aws-events-targets');
import { NodeFunction } from "./node-function";
import { PackageStore } from "./storage";
import ids = require('./ingestion-lambda/ids');

export interface MonitorProps {
  readonly store: PackageStore;
}

export class Ingestion extends Construct {
  constructor(scope: Construct, id: string, props: MonitorProps) {
    super(scope, id);

    const handler = new NodeFunction(this, 'Timer', {
      codeDirectory: __dirname + '/ingestion-lambda',
      environment: {
        [ids.Environment.PACKAGE_STORE_TABLE_NAME]: props.store.table.tableName
      }
    });

    new events.Rule(this, 'Tick', {
      schedule: events.Schedule.rate(Duration.minutes(1)),
      targets: [ new targets.LambdaFunction(handler) ]
    });

    props.store.table.grantWriteData(handler);
  }
}
