/* globals describe */
/* globals it */
/* globals beforeEach */

const expect = require('chai').expect;
const sinon = require('sinon');

const ErrorFetcher = require('../../src/errors/error-fetcher');
const Output = require('../../src/common/output');

describe('ErrorFetcher()', function() {
  it('should initialize successfully', function() {
    const options = {
      accessToken: 'abcd',
      environment: 'production',
      framework: 'ruby',
      json: false
    };
    const fetcher = new ErrorFetcher(options);

    expect(fetcher.environment).to.equal(options.environment);
    expect(fetcher.framework).to.equal(options.framework);
    expect(fetcher.jsonOutput).to.equal(options.json);
    expect(fetcher).to.have.property('rollbarAPI');
    expect(fetcher.rollbarAPI.accessToken).to.equal(options.accessToken);
  });

  it('should use default environment', function() {
    const options = {
      accessToken: 'abcd'
    };
    const fetcher = new ErrorFetcher(options);

    expect(fetcher.environment).to.equal('production');
  });
});

describe('.getError()', function() {
  beforeEach(function() {
    global.output = new Output({quiet: true});
  });

  it('should get error successfully', async function() {
    const options = {
      accessToken: 'abcd'
    };
    const fetcher = new ErrorFetcher(options);
    const stub = sinon.stub(fetcher.rollbarAPI.axios, 'get');
    stub.resolves({
      status: 200,
      statusText: 'Success',
      data: {
        err: 0,
        result: {
          id: 123,
          counter: 123,
          title: 'Test Error',
          level: 'error',
          status: 'active',
          environment: 'production',
          total_occurrences: 10,
          first_occurrence_timestamp: 1640000000,
          last_occurrence_timestamp: 1640001000
        }
      }
    });

    await fetcher.getError(123);

    expect(stub.callCount).to.equal(1);
    expect(stub.firstCall.args[0]).to.equal('/item/123');

    stub.restore();
  });

  it('should handle API errors', async function() {
    const options = {
      accessToken: ''
    };

    const fetcher = new ErrorFetcher(options);
    const stub = sinon.stub(fetcher.rollbarAPI.axios, 'get');
    stub.resolves({
      status: 401,
      statusText: 'Unauthorized',
      data: { err: 1, message: 'invalid access token'}
    });

    await fetcher.getError(123);

    expect(stub.callCount).to.equal(1);

    stub.restore();
  });
});

describe('.listErrors()', function() {
  beforeEach(function() {
    global.output = new Output({quiet: true});
  });

  it('should list errors successfully', async function() {
    const options = {
      accessToken: 'abcd',
      environment: 'production'
    };
    const fetcher = new ErrorFetcher(options);
    const stub = sinon.stub(fetcher.rollbarAPI.axios, 'get');
    stub.resolves({
      status: 200,
      statusText: 'Success',
      data: {
        err: 0,
        result: {
          items: [
            {
              id: 123,
              counter: 123,
              title: 'Test Error 1',
              level: 'error',
              status: 'active',
              environment: 'production',
              total_occurrences: 10,
              first_occurrence_timestamp: 1640000000,
              last_occurrence_timestamp: 1640001000
            },
            {
              id: 124,
              counter: 124,
              title: 'Test Error 2',
              level: 'warning',
              status: 'active',
              environment: 'production',
              total_occurrences: 5,
              first_occurrence_timestamp: 1640000000,
              last_occurrence_timestamp: 1640001000
            }
          ]
        }
      }
    });

    await fetcher.listErrors(25);

    expect(stub.callCount).to.equal(1);
    expect(stub.firstCall.args[0]).to.equal('/items/');
    expect(stub.firstCall.args[1].params.limit).to.equal(25);
    expect(stub.firstCall.args[1].params.environment).to.equal('production');

    stub.restore();
  });

  it('should include framework in params', async function() {
    const options = {
      accessToken: 'abcd',
      environment: 'production',
      framework: 'ruby'
    };
    const fetcher = new ErrorFetcher(options);
    const stub = sinon.stub(fetcher.rollbarAPI.axios, 'get');
    stub.resolves({
      status: 200,
      statusText: 'Success',
      data: {
        err: 0,
        result: { items: [] }
      }
    });

    await fetcher.listErrors(10);

    expect(stub.callCount).to.equal(1);
    expect(stub.firstCall.args[1].params.framework).to.equal('ruby');

    stub.restore();
  });
});

describe('.listErrorsByPerson()', function() {
  beforeEach(function() {
    global.output = new Output({quiet: true});
  });

  it('should list errors by person successfully', async function() {
    const options = {
      accessToken: 'abcd',
      environment: 'production'
    };
    const fetcher = new ErrorFetcher(options);
    const stub = sinon.stub(fetcher.rollbarAPI.axios, 'get');
    stub.resolves({
      status: 200,
      statusText: 'Success',
      data: {
        err: 0,
        result: { items: [] }
      }
    });

    await fetcher.listErrorsByPerson('12345', 25);

    expect(stub.callCount).to.equal(1);
    expect(stub.firstCall.args[0]).to.equal('/items/');
    expect(stub.firstCall.args[1].params.assigned_user).to.equal('12345');
    expect(stub.firstCall.args[1].params.limit).to.equal(25);

    stub.restore();
  });
});

describe('.listErrorsByDate()', function() {
  beforeEach(function() {
    global.output = new Output({quiet: true});
  });

  it('should list errors by date successfully', async function() {
    const options = {
      accessToken: 'abcd',
      environment: 'production'
    };
    const fetcher = new ErrorFetcher(options);
    const stub = sinon.stub(fetcher.rollbarAPI.axios, 'get');
    stub.resolves({
      status: 200,
      statusText: 'Success',
      data: {
        err: 0,
        result: { items: [] }
      }
    });

    await fetcher.listErrorsByDate('2024-01-15', '2024-01-31', 25);

    expect(stub.callCount).to.equal(1);
    expect(stub.firstCall.args[0]).to.equal('/items/');
    expect(stub.firstCall.args[1].params).to.have.property('min_occurred_timestamp');
    expect(stub.firstCall.args[1].params).to.have.property('max_occurred_timestamp');
    expect(stub.firstCall.args[1].params.limit).to.equal(25);

    stub.restore();
  });

  it('should handle invalid date format', async function() {
    const options = {
      accessToken: 'abcd'
    };
    const fetcher = new ErrorFetcher(options);

    try {
      await fetcher.listErrorsByDate('invalid-date', '2024-01-31', 25);
      expect.fail('Should have thrown an error');
    } catch (e) {
      expect(e.message).to.include('Invalid date format');
    }
  });
});

describe('.buildListParams()', function() {
  it('should build params with environment', function() {
    const options = {
      accessToken: 'abcd',
      environment: 'staging'
    };
    const fetcher = new ErrorFetcher(options);
    const params = fetcher.buildListParams({ limit: 10 });

    expect(params.environment).to.equal('staging');
    expect(params.limit).to.equal(10);
    expect(params.status).to.equal('active');
  });

  it('should build params with framework', function() {
    const options = {
      accessToken: 'abcd',
      framework: 'javascript'
    };
    const fetcher = new ErrorFetcher(options);
    const params = fetcher.buildListParams({ limit: 10 });

    expect(params.framework).to.equal('javascript');
  });
});

describe('.parseDate()', function() {
  it('should parse ISO date successfully', function() {
    const options = {
      accessToken: 'abcd'
    };
    const fetcher = new ErrorFetcher(options);
    const timestamp = fetcher.parseDate('2024-01-15');

    expect(timestamp).to.be.a('number');
    expect(timestamp).to.be.greaterThan(0);
  });

  it('should parse ISO datetime successfully', function() {
    const options = {
      accessToken: 'abcd'
    };
    const fetcher = new ErrorFetcher(options);
    const timestamp = fetcher.parseDate('2024-01-15T10:30:00Z');

    expect(timestamp).to.be.a('number');
    expect(timestamp).to.be.greaterThan(0);
  });

  it('should throw error for invalid date', function() {
    const options = {
      accessToken: 'abcd'
    };
    const fetcher = new ErrorFetcher(options);

    expect(() => fetcher.parseDate('not-a-date')).to.throw('Invalid date format');
  });
});
