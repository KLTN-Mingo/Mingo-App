// polyfills.ts
import { Buffer } from "buffer";
global.Buffer = Buffer;
global.process = require("process/browser");
