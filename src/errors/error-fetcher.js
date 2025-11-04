'use strict';

const RollbarAPI = require('../common/rollbar-api');

class ErrorFetcher {
  constructor(options) {
    this.rollbarAPI = new RollbarAPI(options.accessToken);
    this.environment = options.environment || 'production';
    this.framework = options.framework;
    this.jsonOutput = options.json || false;
  }

  async getError(counter) {
    let result;
    try {
      result = await this.rollbarAPI.getItem(counter);
    } catch (e) {
      output.error('Error', e.message);
      return;
    }

    if (result.error) {
      output.error('Error', result.data);
      return;
    }

    this.formatSingleItem(result.result);
    output.success('', 'Item retrieved successfully');
  }

  async listErrors(limit = 25) {
    const params = this.buildListParams({ limit });

    let result;
    try {
      result = await this.rollbarAPI.listItems(params);
    } catch (e) {
      output.error('Error', e.message);
      return;
    }

    if (result.error) {
      output.error('Error', result.data);
      return;
    }

    this.formatItemList(result.result.items);
    output.success('', `Retrieved ${result.result.items.length} items`);
  }

  async listErrorsByPerson(personId, limit = 25) {
    const params = this.buildListParams({ limit, assigned_user: personId });

    let result;
    try {
      result = await this.rollbarAPI.listItems(params);
    } catch (e) {
      output.error('Error', e.message);
      return;
    }

    if (result.error) {
      output.error('Error', result.data);
      return;
    }

    this.formatItemList(result.result.items);
    output.success('', `Retrieved ${result.result.items.length} items for person ${personId}`);
  }

  async listErrorsByDate(startDate, endDate, limit = 25) {
    const params = this.buildListParams({
      limit,
      min_occurred_timestamp: this.parseDate(startDate),
      max_occurred_timestamp: this.parseDate(endDate)
    });

    let result;
    try {
      result = await this.rollbarAPI.listItems(params);
    } catch (e) {
      output.error('Error', e.message);
      return;
    }

    if (result.error) {
      output.error('Error', result.data);
      return;
    }

    this.formatItemList(result.result.items);
    output.success('', `Retrieved ${result.result.items.length} items between ${startDate} and ${endDate}`);
  }

  buildListParams(additionalParams = {}) {
    const params = Object.assign({
      status: 'active'
    }, additionalParams);

    if (this.environment) {
      params.environment = this.environment;
    }

    if (this.framework) {
      params.framework = this.framework;
    }

    return params;
  }

  parseDate(dateString) {
    // Try to parse the date string and convert to Unix timestamp
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateString}. Use ISO 8601 format (e.g., 2024-01-15 or 2024-01-15T10:30:00Z)`);
    }
    return Math.floor(date.getTime() / 1000);
  }

  formatSingleItem(item) {
    if (this.jsonOutput) {
      console.log(JSON.stringify(item, null, 2));
      return;
    }

    // Formatted text output for single item
    output.status('ID', item.id);
    output.status('Counter', item.counter);
    output.status('Title', item.title || 'N/A');
    output.status('Level', this.formatLevel(item.level));
    output.status('Status', item.status);
    output.status('Env', item.environment);
    if (item.framework) {
      output.status('Frame', item.framework);
    }
    output.status('First', this.formatTimestamp(item.first_occurrence_timestamp));
    output.status('Last', this.formatTimestamp(item.last_occurrence_timestamp));
    output.status('Count', item.total_occurrences);

    if (item.last_occurrence) {
      output.verbose('', '\nLast Occurrence Details:');
      output.verbose('', JSON.stringify(item.last_occurrence, null, 2));
    }
  }

  formatItemList(items) {
    if (this.jsonOutput) {
      console.log(JSON.stringify(items, null, 2));
      return;
    }

    // Formatted text output for item list
    output.status('', `\nFound ${items.length} items:\n`);

    // Header
    const header = `${'Counter'.padEnd(10)} ${'Level'.padEnd(10)} ${'Title'.padEnd(50)} ${'Count'.padEnd(8)} ${'Last Seen'}`;
    output.status('', header);
    output.status('', '-'.repeat(header.length));

    items.forEach(item => {
      const counter = String(item.counter).padEnd(10);
      const level = this.formatLevel(item.level).padEnd(10);
      const title = this.truncate(item.title || 'N/A', 50).padEnd(50);
      const count = String(item.total_occurrences).padEnd(8);
      const lastSeen = this.formatTimestamp(item.last_occurrence_timestamp);

      const line = `${counter} ${level} ${title} ${count} ${lastSeen}`;

      // Color code by level
      if (item.level === 'critical' || item.level === 'error') {
        output.error('', line);
      } else if (item.level === 'warning') {
        output.warn('', line);
      } else {
        output.status('', line);
      }
    });
  }

  formatLevel(level) {
    const levelMap = {
      'debug': 'DEBUG',
      'info': 'INFO',
      'warning': 'WARN',
      'error': 'ERROR',
      'critical': 'CRIT'
    };
    return levelMap[level] || level.toUpperCase();
  }

  formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
  }

  truncate(str, maxLength) {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }
}

module.exports = ErrorFetcher;
