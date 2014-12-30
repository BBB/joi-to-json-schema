import assert from 'assert';

// Converter helpers for Joi types.
let TYPES = {
  array: (schema, joi) => {
    schema.type = 'array';
    return schema;
  },

  boolean: (schema, joi) => {
    schema.type = 'boolean';
    return schema;
  },

  number: (schema, joi) => {
    schema.type = 'number';
    return schema;
  },

  string: (schema, joi) => {
    schema.type = 'string';
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

  return TYPES[joi._type](schema, joi);
}
