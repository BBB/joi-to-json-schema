import assert from 'assert';

// Converter helpers for Joi types.
let TYPES = {
  alternatives: (schema, joi) => {
    schema.oneOf = [];
    for (let match of joi._inner.matches) {
      schema.oneOf.push(convert(match.schema));
    }
    return schema;
  },

  date: (schema, joi) => {
    schema.type = 'string';
    schema.format = 'date-time';
    return schema;
  },

  array: (schema, joi) => {
    schema.type = 'array';
    for (let test of joi._tests) {
      switch (test.name) {
        case 'unique':
          schema.uniqueItems = true;
          break;
        case 'length':
          schema.minItems = schema.maxItems = test.arg;
          break;
        case 'min':
          schema.minItems = test.arg;
          break;
        case 'max':
          schema.maxItems = test.arg;
          break;
      }
    }

    return schema;
  },

  boolean: (schema, joi) => {
    schema.type = 'boolean';
    return schema;
  },

  number: (schema, joi) => {
    schema.type = 'number';
    for (let test of joi._tests) {
      switch (test.name) {
        case 'integer':
          schema.type = 'integer';
          break;
        case 'less':
          schema.exclusiveMaximum = true;
          schema.maximum = test.arg;
          break;
        case 'greater':
          schema.exclusiveMinimum = true;
          schema.minimum = test.arg;
          break;
        case 'min':
          schema.minimum = test.arg;
          break;
        case 'max':
          schema.maximum = test.arg;
          break;
      }
    }
    return schema;
  },

  string: (schema, joi) => {
    schema.type = 'string';

    for (let test of joi._tests) {
      switch (test.name) {
        case 'email':
          schema.format = 'email';
          break;
        case 'regex':
          schema.pattern = String(test.arg);
          break;
        case 'min':
          schema.minLength = test.arg;
          break;
        case 'max':
          schema.maxLength = test.arg;
          break;
        case 'length':
          schema.minLength = schema.maxLength = test.arg;
          break;
      }
    }

    return schema;
  },

  object: (schema, joi) => {
    schema.type = 'object';
    schema.properties = {};
    schema.additionalProperties = joi._flags.allowUnknown || false;


    if (!joi._inner.children) return schema;

    for (let property of joi._inner.children) {
      schema.properties[property.key] = convert(property.schema);
      if (property.schema._flags.presence === 'required') {
        schema.required = schema.required || [];
        schema.required.push(property.key);
      }
    }

    return schema;
  }
};

export default function convert(joi) {
  assert(joi._type, 'has type');
  assert(TYPES[joi._type], `cannot convert ${joi._type}`);

  // JSON Schema root for this type.
  let schema = {};

  // Copy over the details that all schemas may have...
  if (joi._description) schema.description = joi._description;
  if (joi._flags && joi._flags.default) {
    schema.default = joi._flags.default;
  }

  if (joi._valids && joi._valids._set && joi._valids._set.length) {
    schema.enum = joi._valids._set;
  }

  return TYPES[joi._type](schema, joi);
}
