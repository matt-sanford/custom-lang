import { program } from 'commander';
import fs from 'fs';

import { parse } from './parser.js';
import {interpret} from "./interpreter.js";

program.argument('<filename>');
program.parse();

const filename = program.args[0];
const code = fs.readFileSync(filename, 'utf-8');

const statements = parse(code);
interpret(statements);