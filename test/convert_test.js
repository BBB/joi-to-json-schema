import * as Joi from 'Joi';
import convert from '../src/index';
import assert from 'assert';

suite('convert', function() {

  test('object defaults', function() {
    assert.deepEqual(convert(Joi.object()), {
      type: 'object',
      properties: {},
      additionalProperties: false
    });
  });

  test('object description', function() {
    assert.deepEqual(convert(Joi.object().description('woot')), {
      type: 'object',
      properties: {},
      additionalProperties: false,
      description: 'woot'
    });
  });

  test('object allow unknown', function() {
    assert.deepEqual(convert(Joi.object().unknown(true)), {
      type: 'object',
      properties: {},
      additionalProperties: true
    });
  });

  test('object', function() {
    let obj = Joi.object().keys({
      string: Joi.string(),
      'string default': Joi.string().default('bar').description('bar desc'),
      'number': Joi.number(),
      'boolean required': Joi.boolean().required(),
    });

    assert.deepEqual(convert(obj), {
      type: 'object',
      required: ['boolean required'],
      properties: {
        'string': {
          type: 'string'
        },
        'string default': {
          type: 'string',
          default: 'bar',
          description: 'bar desc'
        },
        'number': {
          type: 'number'
        },
        'boolean required': {
          type: 'boolean'
        }
      },
      additionalProperties: false
    });
  });

  test('type: array', function() {
    assert.deepEqual(convert(Joi.array()), {
      type: 'array'
    });
  });

  test('enum', function() {
    assert.deepEqual(convert(Joi.string().valid(['a', 'b'])), {
      type: 'string',
      enum: ['a', 'b']
    });
  });

  test('alternatives -> oneOf', function() {
    let joi = Joi.object().keys({
      value: Joi.alternatives().try(
        Joi.string().valid('a'),
        Joi.number().valid(100)
      )
    });

    assert.deepEqual(convert(joi), {
      type: 'object',
      additionalProperties: false,
      properties: {
        value: {
          oneOf: [
            { type: 'string', enum: ['a'] },
            { type: 'number', enum: [100] },
          ]
        }
      }
    });
  });

  test('string -> maxLength', function() {
    assert.deepEqual(convert(Joi.string().length(5)), {
      type: 'string',
      maxLength: 5
    });
  });
});
