'use strict';

/* eslint-disable max-len */
var td              = require('testdouble');
var expect          = require('../../../helpers/expect');
var mockProject     = require('../../../fixtures/ember-cordova-mock/project');
var ValidateNav     = require('../../../../lib/tasks/validate/allow-navigation');
/* eslint-enable max-len */

describe('Validate Allow Navigation Test', function() {
  afterEach(function() {
    td.reset();
  });

  function setupTask() {
    return new ValidateNav({
      project: mockProject.project,
      ui: mockProject.ui
    });
  }

  it('writes UNSAFE_PRODUCTION_VALUE if allowNavigation is unsafe', function() {
    td.replace(ValidateNav.prototype, 'livereloadProp', function() {
      return 'prop';
    });

    var validateNav = setupTask();
    return validateNav.run().then(function() {
      expect(validateNav.ui.output).to.contain(
        'is unsafe and should not be used in production'
      );
    });
  });

  it('throws error if liveReload is not setup && blockIfUndefined', function() {
    td.replace(ValidateNav.prototype, 'livereloadProp', function() {
      return undefined;
    });

    var validateNav = setupTask();
    return validateNav.run(true).catch(function(error) {
      expect(validateNav.ui.output).to.include('needs the following flag');
    });
  });

  it('resolves immediately if the platform is browser', function() {
    //normally this would cause a rejection
    td.replace(ValidateNav.prototype, 'livereloadProp', function() {
      return undefined;
    });

    var validateNav = setupTask();
    validateNav.platform = 'browser';

    return expect(validateNav.run(true)).to.be.fulfilled;
  });

  context('validateNavigationProp', function() {
    it('returns true if the value is *', function() {
      var validateNav = setupTask();
      expect(validateNav.validateNavigationProp('*')).to.not.equal(undefined);
    });

    it('returns true if the value contains http', function() {
      var validateNav = setupTask();
      expect(
        validateNav.validateNavigationProp('http')
      ).to.not.equal(undefined);
    });

    it('returns true if the value contains https', function() {
      var validateNav = setupTask();
      expect(
        validateNav.validateNavigationProp('https')
      ).to.not.equal(undefined);
    });

    it('does not return true in any other context', function() {
      var validateNav = setupTask();
      var invalidValues = [
        'file://',
        'foo*'
      ];

      var pos = invalidValues.length;
      while (pos--) {
        var value = invalidValues[pos];
        expect(validateNav.validateNavigationProp(value)).to.equal(undefined);
      }
    });
  });

  context('livereloadProp', function() {
    it('checks each item in the json.field array', function() {
      var calls = 0;

      td.replace(ValidateNav.prototype, 'validateNavigationProp', function() {
        calls++;
        return undefined
      });

      var validateNav = setupTask();
      return validateNav.run().then(function() {
        expect(calls).to.equal(2);
      });
    });
  });
});
