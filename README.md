# rollbar-cli (Extended Fork)

> **Note**: This is a fork of the [official Rollbar CLI](https://github.com/rollbar/rollbar-cli) with additional error lookup and querying capabilities.

The Rollbar CLI provides easy command line access to Rollbar's API features,
including source map uploads, deploy notifications, and **error querying** (new in this fork).

![build](https://github.com/rollbar/rollbar-cli/workflows/Node.js%20CI/badge.svg)

## Install

```
npm install -g rollbar-cli
```

## What's New in This Fork

### 🆕 Error Lookup Commands
This fork adds powerful error querying capabilities, allowing you to search and analyze Rollbar errors directly from the command line:

- **`errors get`** - Get detailed information about a specific error
- **`errors list`** - List recent errors with filtering options
- **`errors by-person`** - Find errors assigned to a specific person
- **`errors by-date`** - Search errors within a date range

All error commands support:
- 🔐 **Environment variable support** (`ROLLBAR_ACCESS_TOKEN`)
- 🎨 **Dual output modes** (formatted text or JSON with `--json`)
- 🔍 **Advanced filtering** (by environment, framework, limit)
- 🌈 **Color-coded output** (errors in red, warnings in yellow)

[Jump to error commands documentation ↓](#error-commands-new)

---

## Usage and Reference
This CLI supports three main command groups: **error querying** (new), **source map uploads**, and **deploy notifications**.

### upload-sourcemaps
Upload source maps recursively from a directory.

```
rollbar-cli upload-sourcemaps <path> [options]

upload sourcemaps

Options:
  --version       Show version number                                  [boolean]
  -v, --verbose   Verbose status output                                [boolean]
  -q, --quiet     Silent status output                                 [boolean]
  --help          Show help                                            [boolean]
  --access-token  Access token for the Rollbar API           [string] [required]
  --url-prefix    Base part of the stack trace URLs          [string] [required]
  --code-version  Code version string must match value in the Rollbar item
                                                             [string] [required]
  --next          Next version. Zip all the source map files and upload as one
                  file                                                 [boolean]
  -D, --dry-run   Scan and validate source maps without uploading      [boolean]
```

Some of these options are required and must be specified for a successful upload.

`path`: Absolute or relative path to build directory. This directory should contain .js
files with `sourceMappingURL` directives included. The current version of the CLI
supports detecting files with `sourceMappingURL` directives and uploading related
map files within a directory.

`--access-token`: The Rollbar API `post_server_item` token.

`--url-prefix`: The base portion of the URL to be concatenated with the js filenames
discovered while scanning `path`. The Rollbar backend uses this to match stack frame locations
and it must exactly match the URLs in the error stack frames. See `minified_url` at
[Source Maps](https://docs.rollbar.com/docs/source-maps) for more information.

`--code-version`: The code version string must match the string passed in the Rollbar
error payload, which is usually set in the config options for Rollbar.js.
See [Source Maps](https://docs.rollbar.com/docs/source-maps) for more information.

`--next`: This is an optional parameter triggering next version. When specified, all source map files
are compressed and uploaded as one zip file directly.

Example:
```
rollbar-cli upload-sourcemaps ./dist --access-token 638d... --url-prefix 'http://example.com/' --code-version 123.456
```
or
```
rollbar-cli upload-sourcemaps ./dist --access-token 638d... --url-prefix 'http://example.com/' --code-version 123.456 --next
```

### notify-deploy
Notify deploy to Rollbar.

```
rollbar-cli notify-deploy [options]

Notify deploy to Rollbar

Options:
  --version           Show version number                              [boolean]
  -v, --verbose       Verbose status output                            [boolean]
  -q, --quiet         Silent status output                             [boolean]
  --help              Show help                                        [boolean]
  --access-token      Use a post server item access token for the Rollbar API
                                                             [string] [required]
  --code-version      Code version or Git SHA of revision being deployed
                                                             [string] [required]
  --deploy-id         ID of the deploy to update                        [string]
  --environment       Environment to which the revision was deployed such as
                      production                             [string] [required]
  --status            Status of the deploy - started, succeeded (default),
                      failed, or timed_out                              [string]
  --rollbar-username  Rollbar username of person who deployed           [string]
  --local-username    Local username of person who deployed             [string]
  --comment           Additional text to include with the deploy        [string]
```

Example:
```
rollbar-cli notify-deploy --access-token 1234 --code-version 1.0.1 --environment production --rollbar-username foobar --status succeeded --local-username foo_bar --comment 'Deploy Test'
```

Output on success:
```
         { deploy_id: 12345678 }
         Deploy successful
```

### Error Commands (NEW)

Query and search Rollbar errors directly from the command line.

#### Setup: Environment Variable (Recommended)

Instead of passing `--access-token` with every command, set the environment variable once:

```bash
export ROLLBAR_ACCESS_TOKEN="your_rollbar_token_here"
```

Add this to your `~/.zshrc` or `~/.bashrc` to make it permanent.

#### errors get

Get detailed information about a specific error by its item counter.

```bash
rollbar-cli errors get <counter> [options]

Options:
  --access-token  Access token (or set ROLLBAR_ACCESS_TOKEN env var)  [string]
  --json          Output as JSON                    [boolean] [default: false]
```

Example:
```bash
rollbar-cli errors get 12345
```

#### errors list

List recent errors with optional filtering.

```bash
rollbar-cli errors list [options]

Options:
  --access-token  Access token (or set ROLLBAR_ACCESS_TOKEN env var)  [string]
  --environment   Filter by environment        [string] [default: "production"]
  --framework     Filter by framework (ruby, rails, javascript)       [string]
  --limit         Number of items to retrieve       [number] [default: 25]
  --json          Output as JSON                    [boolean] [default: false]
```

Examples:
```bash
# List recent production errors
rollbar-cli errors list

# List errors in staging environment
rollbar-cli errors list --environment staging

# List JavaScript errors only
rollbar-cli errors list --framework javascript

# Get 50 Ruby errors in production
rollbar-cli errors list --framework ruby --limit 50

# Get JSON output for piping to jq
rollbar-cli errors list --json | jq '.[] | {title, level}'
```

#### errors by-person

List errors assigned to a specific person.

```bash
rollbar-cli errors by-person <person-id> [options]

Options:
  --access-token  Access token (or set ROLLBAR_ACCESS_TOKEN env var)  [string]
  --environment   Filter by environment        [string] [default: "production"]
  --framework     Filter by framework (ruby, rails, javascript)       [string]
  --limit         Number of items to retrieve       [number] [default: 25]
  --json          Output as JSON                    [boolean] [default: false]
```

Example:
```bash
rollbar-cli errors by-person 67890 --environment production
```

#### errors by-date

Search errors within a specific date range.

```bash
rollbar-cli errors by-date <start> <end> [options]

Positionals:
  start  Start date (ISO 8601 format, e.g., 2024-01-15)   [string] [required]
  end    End date (ISO 8601 format, e.g., 2024-01-31)     [string] [required]

Options:
  --access-token  Access token (or set ROLLBAR_ACCESS_TOKEN env var)  [string]
  --environment   Filter by environment        [string] [default: "production"]
  --framework     Filter by framework (ruby, rails, javascript)       [string]
  --limit         Number of items to retrieve       [number] [default: 25]
  --json          Output as JSON                    [boolean] [default: false]
```

Examples:
```bash
# Search errors in January 2024
rollbar-cli errors by-date 2024-01-01 2024-01-31

# Search with specific time
rollbar-cli errors by-date 2024-01-15T10:00:00Z 2024-01-15T18:00:00Z

# Search Ruby errors in staging during a specific week
rollbar-cli errors by-date 2024-01-15 2024-01-21 \
  --environment staging \
  --framework ruby
```

#### Output Formats

**Formatted Text (default):**
```
Found 3 items:

Counter    Level      Title                                              Count    Last Seen
--------------------------------------------------------------------------------------------
12345      ERROR      Undefined method 'foo' on nil:NilClass            42       2024-01-15 10:30:00 UTC
12346      WARN       Deprecated API usage                              15       2024-01-15 09:15:00 UTC
12347      ERROR      Database connection timeout                       8        2024-01-14 18:45:00 UTC
```

**JSON (with --json flag):**
```json
[
  {
    "id": 12345,
    "counter": 12345,
    "title": "Undefined method 'foo' on nil:NilClass",
    "level": "error",
    "total_occurrences": 42,
    "last_occurrence_timestamp": 1705315800
  }
]
```

## Release History & Changelog

See our [Releases](https://github.com/rollbar/rollbar-cli/releases) page for a list of all releases, including changes.

## Help / Support

### For Fork-Specific Features (error commands)
For issues or questions about the error lookup commands added in this fork, please [open an issue on this fork's GitHub](https://github.com/atestu/rollbar-cli/issues/new).

### For Original Features (sourcemaps, deploys)
For issues with the original Rollbar CLI features, please refer to the [official Rollbar CLI repository](https://github.com/rollbar/rollbar-cli) or email [support@rollbar.com](mailto:support@rollbar.com).

## Developing

To set up a development environment, you'll need Node.js and npm.

1. Install dependencies
`npm install`

2. Link the rollbar-cli command to the local repo
`npm link`

3. Run the tests
`npm test`

## Contributing

1. [Fork it](https://github.com/rollbar/rollbar-cli).
2. Create your feature branch (`git checkout -b my-new-feature`).
3. Commit your changes (`git commit -am 'Added some feature'`).
4. Push to the branch (`git push origin my-new-feature`).
5. Create a new Pull Request.

## License

rollbar-cli is free software released under the MIT License. See LICENSE for details.
