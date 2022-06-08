'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./fields-s3.cjs.prod.js");
} else {
  module.exports = require("./fields-s3.cjs.dev.js");
}
