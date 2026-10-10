"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
var claude_code_1 = require("claude-code");
var PANE = 'translate-output';
var STORE_KEY = 'language';
var MODEL = 'haiku';
var language = (0, claude_code_1.atom)({ plugin: 'translate-output', key: 'language' }, null);
var latest = (0, claude_code_1.atom)({ plugin: 'translate-output', key: 'latest' }, null);
var USAGE = [
    'Usage:',
    '  /translate <language>   turn on, translating final answers into <language>',
    '  /translate off          turn off',
    '  /translate              show the current setting and open the pane',
].join('\n');
function translationPrompt(target, answer) {
    return [
        "Translate the text inside <text> into ".concat(target, "."),
        'Keep Markdown formatting, code blocks, file paths, commands and identifiers',
        'exactly as they are. Reply with the translation only, no preamble.',
        '',
        "<text>\n".concat(answer, "\n</text>"),
    ].join('\n');
}
var register = function (on) {
    on('session.start', function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        var stored;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, $.command.register({
                        name: 'translate',
                        description: 'Translate final answers: /translate <language> | off',
                    })
                    // The chosen language persists across sessions; mirror it into session state.
                ];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, $.store.get(STORE_KEY)];
                case 2:
                    stored = _a.sent();
                    return [4 /*yield*/, (0, claude_code_1.update)($, language, function () { return (typeof stored === 'string' ? stored : null); })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, next(e)];
            }
        });
    }); });
    on('command.run', { command: 'translate' }, function ($, e) { return __awaiter(void 0, void 0, void 0, function () {
        var arg, current;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    arg = e.args.trim();
                    if (!(arg === '')) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, claude_code_1.read)($, language)];
                case 1:
                    current = _a.sent();
                    if (current === null) {
                        return [2 /*return*/, { text: "Translation is off.\n".concat(USAGE) }];
                    }
                    return [4 /*yield*/, $.ui.open({ id: PANE, title: "Translation (".concat(current, ")") })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { text: "Translating final answers into ".concat(current, ".") }];
                case 3:
                    if (!(arg.toLowerCase() === 'off')) return [3 /*break*/, 8];
                    return [4 /*yield*/, $.store.delete(STORE_KEY)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, claude_code_1.update)($, language, function () { return null; })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, (0, claude_code_1.update)($, latest, function () { return null; })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, $.ui.close({ id: PANE })];
                case 7:
                    _a.sent();
                    return [2 /*return*/, { text: 'Translation turned off.' }];
                case 8: return [4 /*yield*/, $.store.set(STORE_KEY, arg)];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, (0, claude_code_1.update)($, language, function () { return arg; })];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, $.ui.open({ id: PANE, title: "Translation (".concat(arg, ")") })];
                case 11:
                    _a.sent();
                    return [2 /*return*/, { text: "Translation on: final answers will be translated into ".concat(arg, ".") }];
            }
        });
    }); });
    on('turn.complete', function ($, e, next) { return __awaiter(void 0, void 0, void 0, function () {
        var result, target, isFinalAnswer, pending, reply, done;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, next(e)];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, language)
                        // Main loop only (subagents carry an agentId), and only a real final answer.
                    ];
                case 2:
                    target = _a.sent();
                    isFinalAnswer = e.agentId === undefined && e.reason === 'answer' && e.answer.trim() !== '';
                    if (target === null || !isFinalAnswer) {
                        return [2 /*return*/, result];
                    }
                    pending = { language: target, text: '', status: 'translating' };
                    return [4 /*yield*/, (0, claude_code_1.update)($, latest, function () { return pending; })];
                case 3:
                    _a.sent();
                    $.ui.status("Translating to ".concat(target, "\u2026"));
                    return [4 /*yield*/, $.model.complete({
                            model: MODEL,
                            prompt: translationPrompt(target, e.answer),
                            maxTokens: 16000,
                            effort: 'low',
                            timeoutMs: 120000,
                        })];
                case 4:
                    reply = _a.sent();
                    done = reply.isAnswered
                        ? { language: target, text: reply.text, status: 'done' }
                        : { language: target, text: "Translation failed (".concat(reply.reason, ")."), status: 'error' };
                    return [4 /*yield*/, (0, claude_code_1.update)($, latest, function () { return done; })];
                case 5:
                    _a.sent();
                    $.ui.status(undefined);
                    return [2 /*return*/, result];
            }
        });
    }); });
    on('ui.render', { component: 'Pane', requestId: PANE }, function ($, e) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, Box, Markdown, Text, target, translation;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = $.ui.resolve(e), Box = _a.Box, Markdown = _a.Markdown, Text = _a.Text;
                    return [4 /*yield*/, (0, claude_code_1.read)($, language)];
                case 1:
                    target = _b.sent();
                    return [4 /*yield*/, (0, claude_code_1.read)($, latest)];
                case 2:
                    translation = _b.sent();
                    if (target === null) {
                        return [2 /*return*/, (<Box flexDirection="column">
          <Text dimColor>Translation is off. Turn it on with /translate &lt;language&gt;.</Text>
        </Box>)];
                    }
                    if (translation === null) {
                        return [2 /*return*/, (<Box flexDirection="column">
          <Text dimColor>The next final answer will be translated into {target}.</Text>
        </Box>)];
                    }
                    if (translation.status === 'translating') {
                        return [2 /*return*/, (<Box flexDirection="column">
          <Text dimColor>Translating into {translation.language}…</Text>
        </Box>)];
                    }
                    if (translation.status === 'error') {
                        return [2 /*return*/, (<Box flexDirection="column">
          <Text color="red">{translation.text}</Text>
        </Box>)];
                    }
                    return [2 /*return*/, (<Box flexDirection="column">
        <Markdown text={translation.text}/>
      </Box>)];
            }
        });
    }); });
};
exports.register = register;
