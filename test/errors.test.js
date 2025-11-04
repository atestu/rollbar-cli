/* globals describe */
/* globals it */
const expect = require('chai').expect;
const exec = require('child_process').exec;

describe('rollbar-cli errors', function() {
  it('returns help output', done => {
    this.timeout(5000);

    exec('./bin/rollbar errors --help', 'utf8', (_err, stdout, _stderr) => {
      expect(stdout).to.have.string('errors <command>');
      expect(stdout).to.have.string('Manage and query Rollbar errors');
      done();
    })
  });

  it('demands a subcommand', done => {
    this.timeout(5000);

    exec('./bin/rollbar errors', 'utf8', (_err, stdout, stderr) => {
      const output = stdout + stderr;
      // Yargs shows the help message and error when no subcommand is provided
      expect(output).to.match(/You must specify a subcommand|Manage and query Rollbar errors/);
      done();
    })
  });

  describe('get subcommand', function() {
    it('returns help output', done => {
      this.timeout(5000);

      exec('./bin/rollbar errors get --help', 'utf8', (_err, stdout, _stderr) => {
        expect(stdout).to.have.string('Get error by item counter');
        expect(stdout).to.have.string('--access-token');
        expect(stdout).to.have.string('--json');
        done();
      })
    });

    it('requires counter argument', done => {
      this.timeout(5000);

      exec('./bin/rollbar errors get --access-token test', 'utf8', (_err, _stdout, stderr) => {
        expect(stderr).to.have.string('Not enough non-option arguments');
        done();
      })
    });
  });

  describe('list subcommand', function() {
    it('returns help output', done => {
      this.timeout(5000);

      exec('./bin/rollbar errors list --help', 'utf8', (_err, stdout, _stderr) => {
        expect(stdout).to.have.string('List recent errors');
        expect(stdout).to.have.string('--access-token');
        expect(stdout).to.have.string('--environment');
        expect(stdout).to.have.string('--framework');
        expect(stdout).to.have.string('--limit');
        expect(stdout).to.have.string('--json');
        done();
      })
    });

    it('has default values', done => {
      this.timeout(5000);

      exec('./bin/rollbar errors list --help', 'utf8', (_err, stdout, _stderr) => {
        expect(stdout).to.have.string('default: "production"');
        expect(stdout).to.have.string('default: 25');
        done();
      })
    });
  });

  describe('by-person subcommand', function() {
    it('returns help output', done => {
      this.timeout(5000);

      exec('./bin/rollbar errors by-person --help', 'utf8', (_err, stdout, _stderr) => {
        expect(stdout).to.have.string('List errors by person ID');
        expect(stdout).to.have.string('--access-token');
        expect(stdout).to.have.string('person-id');
        done();
      })
    });

    it('requires person-id argument', done => {
      this.timeout(5000);

      exec('./bin/rollbar errors by-person --access-token test', 'utf8', (_err, _stdout, stderr) => {
        expect(stderr).to.have.string('Not enough non-option arguments');
        done();
      })
    });
  });

  describe('by-date subcommand', function() {
    it('returns help output', done => {
      this.timeout(5000);

      exec('./bin/rollbar errors by-date --help', 'utf8', (_err, stdout, _stderr) => {
        expect(stdout).to.have.string('Search errors by date range');
        expect(stdout).to.have.string('--access-token');
        expect(stdout).to.have.string('start');
        expect(stdout).to.have.string('end');
        done();
      })
    });

    it('requires start and end arguments', done => {
      this.timeout(5000);

      exec('./bin/rollbar errors by-date --access-token test', 'utf8', (_err, _stdout, stderr) => {
        expect(stderr).to.have.string('Not enough non-option arguments');
        done();
      })
    });
  });
});
