'use strict';

const ErrorFetcher = require('./error-fetcher.js');
const Output = require('../common/output.js');

exports.command = 'errors <command>';

exports.describe = 'Manage and query Rollbar errors';

exports.builder = function (yargs) {
  return yargs
    .command(
      'get <counter>',
      'Get error by item counter',
      (yargs) => {
        return yargs
          .positional('counter', {
            describe: 'Item counter (e.g., 123)',
            type: 'number'
          })
          .option('access-token', {
            describe: 'Use a post server item access token for the Rollbar API (or set ROLLBAR_ACCESS_TOKEN env var)',
            requiresArg: true,
            type: 'string',
            default: process.env.ROLLBAR_ACCESS_TOKEN
          })
          .option('json', {
            describe: 'Output as JSON',
            type: 'boolean',
            default: false
          });
      },
      async (argv) => {
        global.output = new Output({
          verbose: argv['verbose'],
          quiet: argv['quiet']
        });

        if (!argv['access-token']) {
          output.error('Error', 'Access token is required. Provide --access-token or set ROLLBAR_ACCESS_TOKEN environment variable.');
          process.exit(1);
        }

        const fetcher = new ErrorFetcher({
          accessToken: argv['access-token'],
          json: argv['json']
        });

        await fetcher.getError(argv.counter);
      }
    )
    .command(
      'list',
      'List recent errors',
      (yargs) => {
        return yargs
          .option('access-token', {
            describe: 'Use a post server item access token for the Rollbar API (or set ROLLBAR_ACCESS_TOKEN env var)',
            requiresArg: true,
            type: 'string',
            default: process.env.ROLLBAR_ACCESS_TOKEN
          })
          .option('environment', {
            describe: 'Environment to filter by (e.g., production, staging)',
            requiresArg: true,
            type: 'string',
            default: 'production'
          })
          .option('framework', {
            describe: 'Framework to filter by (e.g., ruby, rails, javascript)',
            requiresArg: true,
            type: 'string'
          })
          .option('limit', {
            describe: 'Number of items to retrieve',
            requiresArg: true,
            type: 'number',
            default: 25
          })
          .option('json', {
            describe: 'Output as JSON',
            type: 'boolean',
            default: false
          });
      },
      async (argv) => {
        global.output = new Output({
          verbose: argv['verbose'],
          quiet: argv['quiet']
        });

        if (!argv['access-token']) {
          output.error('Error', 'Access token is required. Provide --access-token or set ROLLBAR_ACCESS_TOKEN environment variable.');
          process.exit(1);
        }

        const fetcher = new ErrorFetcher({
          accessToken: argv['access-token'],
          environment: argv['environment'],
          framework: argv['framework'],
          json: argv['json']
        });

        await fetcher.listErrors(argv.limit);
      }
    )
    .command(
      'by-person <person-id>',
      'List errors by person ID',
      (yargs) => {
        return yargs
          .positional('person-id', {
            describe: 'Person ID to filter by',
            type: 'string'
          })
          .option('access-token', {
            describe: 'Use a post server item access token for the Rollbar API (or set ROLLBAR_ACCESS_TOKEN env var)',
            requiresArg: true,
            type: 'string',
            default: process.env.ROLLBAR_ACCESS_TOKEN
          })
          .option('environment', {
            describe: 'Environment to filter by (e.g., production, staging)',
            requiresArg: true,
            type: 'string',
            default: 'production'
          })
          .option('framework', {
            describe: 'Framework to filter by (e.g., ruby, rails, javascript)',
            requiresArg: true,
            type: 'string'
          })
          .option('limit', {
            describe: 'Number of items to retrieve',
            requiresArg: true,
            type: 'number',
            default: 25
          })
          .option('json', {
            describe: 'Output as JSON',
            type: 'boolean',
            default: false
          });
      },
      async (argv) => {
        global.output = new Output({
          verbose: argv['verbose'],
          quiet: argv['quiet']
        });

        if (!argv['access-token']) {
          output.error('Error', 'Access token is required. Provide --access-token or set ROLLBAR_ACCESS_TOKEN environment variable.');
          process.exit(1);
        }

        const fetcher = new ErrorFetcher({
          accessToken: argv['access-token'],
          environment: argv['environment'],
          framework: argv['framework'],
          json: argv['json']
        });

        await fetcher.listErrorsByPerson(argv['person-id'], argv.limit);
      }
    )
    .command(
      'by-date <start> <end>',
      'Search errors by date range',
      (yargs) => {
        return yargs
          .positional('start', {
            describe: 'Start date (ISO 8601 format, e.g., 2024-01-15)',
            type: 'string'
          })
          .positional('end', {
            describe: 'End date (ISO 8601 format, e.g., 2024-01-31)',
            type: 'string'
          })
          .option('access-token', {
            describe: 'Use a post server item access token for the Rollbar API (or set ROLLBAR_ACCESS_TOKEN env var)',
            requiresArg: true,
            type: 'string',
            default: process.env.ROLLBAR_ACCESS_TOKEN
          })
          .option('environment', {
            describe: 'Environment to filter by (e.g., production, staging)',
            requiresArg: true,
            type: 'string',
            default: 'production'
          })
          .option('framework', {
            describe: 'Framework to filter by (e.g., ruby, rails, javascript)',
            requiresArg: true,
            type: 'string'
          })
          .option('limit', {
            describe: 'Number of items to retrieve',
            requiresArg: true,
            type: 'number',
            default: 25
          })
          .option('json', {
            describe: 'Output as JSON',
            type: 'boolean',
            default: false
          });
      },
      async (argv) => {
        global.output = new Output({
          verbose: argv['verbose'],
          quiet: argv['quiet']
        });

        if (!argv['access-token']) {
          output.error('Error', 'Access token is required. Provide --access-token or set ROLLBAR_ACCESS_TOKEN environment variable.');
          process.exit(1);
        }

        const fetcher = new ErrorFetcher({
          accessToken: argv['access-token'],
          environment: argv['environment'],
          framework: argv['framework'],
          json: argv['json']
        });

        await fetcher.listErrorsByDate(argv.start, argv.end, argv.limit);
      }
    )
    .demandCommand(1, 'You must specify a subcommand (get, list, by-person, by-date)')
    .help();
};

exports.handler = function () {
  // This handler is not used because subcommands have their own handlers
};
