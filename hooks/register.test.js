"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var testing_1 = require("claude-code/testing");
var USAGE = {
    input_tokens: 1,
    output_tokens: 1,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
};
var stubEngine = function (on) {
    on('session.start', function (_$, e) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ cwd: e.cwd })];
    }); }); });
    on('command.register', function (_$, e) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ value: { command: e.name } })];
    }); }); });
    testing_1.mock.store(on);
    on('ui.open', function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ value: { isPlaced: true } })];
    }); }); });
    on('ui.close', function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ value: undefined })];
    }); }); });
    on('ui.status', function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ value: undefined })];
    }); }); });
    on('turn.complete', function (_$, e) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ text: e.answer })];
    }); }); });
};
var COMMAND = {
    command: 'translate',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 160 },
};
var PANE = {
    plugin: 'translate-output',
    component: 'Pane',
    requestId: 'translate-output',
    props: {
        title: 'Translation',
        isFocused: false,
        bodyColumns: 60,
        placement: 'dock',
        scroll: { offset: 0, bodyRows: 20 },
        view: {},
    },
};
(0, testing_1.test)('translates the final answer into the chosen language', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var prompts, result, _i, _a, surface, ui, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                prompts = [];
                on('model.complete', function (_$, e) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        prompts.push(e.prompt);
                        return [2 /*return*/, { value: { isAnswered: true, text: '**こんにちは**、世界', usage: USAGE } }];
                    });
                }); });
                stubEngine(on);
                return [4 /*yield*/, $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })];
            case 1:
                _c.sent();
                return [4 /*yield*/, $.command.run(__assign(__assign({}, COMMAND), { args: 'Japanese' }))];
            case 2:
                _c.sent();
                return [4 /*yield*/, $.turn.complete({
                        answer: 'Hello, world',
                        durationMs: 10,
                        isAborted: false,
                        turnId: 't1',
                        reason: 'answer',
                    })
                    // The original answer is untouched; translation goes to the pane.
                ];
            case 3:
                result = _c.sent();
                // The original answer is untouched; translation goes to the pane.
                (0, testing_1.expect)(result.text).toBe('Hello, world');
                (0, testing_1.expect)(prompts).toHaveLength(1);
                (0, testing_1.expect)(prompts[0]).toContain('Japanese');
                (0, testing_1.expect)(prompts[0]).toContain('Hello, world');
                _i = 0, _a = ['terminal', 'desktop'];
                _c.label = 4;
            case 4:
                if (!(_i < _a.length)) return [3 /*break*/, 9];
                surface = _a[_i];
                return [4 /*yield*/, $.ui.mount(__assign(__assign({}, PANE), { surface: surface }))];
            case 5:
                ui = _c.sent();
                _b = testing_1.expect;
                return [4 /*yield*/, ui.find({ type: 'Markdown', text: /\*\*こんにちは\*\*/ })];
            case 6:
                _b.apply(void 0, [_c.sent()]).toBeDefined();
                return [4 /*yield*/, ui.unmount()];
            case 7:
                _c.sent();
                _c.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 4];
            case 9: return [2 /*return*/];
        }
    });
}); });
(0, testing_1.test)('skips subagent turns, aborted turns and when off', function ($, on) { return __awaiter(void 0, void 0, void 0, function () {
    var calls, base;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                calls = 0;
                on('model.complete', function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        calls += 1;
                        return [2 /*return*/, { value: { isAnswered: true, text: 'x', usage: USAGE } }];
                    });
                }); });
                stubEngine(on);
                return [4 /*yield*/, $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })];
            case 1:
                _a.sent();
                base = { answer: 'Hi', durationMs: 1, isAborted: false, turnId: 't' };
                return [4 /*yield*/, $.turn.complete(__assign(__assign({}, base), { reason: 'answer' }))];
            case 2:
                _a.sent();
                (0, testing_1.expect)(calls).toBe(0);
                return [4 /*yield*/, $.command.run(__assign(__assign({}, COMMAND), { args: 'French' }))];
            case 3:
                _a.sent();
                return [4 /*yield*/, $.turn.complete(__assign(__assign({}, base), { reason: 'answer', agentId: 'sub-1' }))];
            case 4:
                _a.sent();
                return [4 /*yield*/, $.turn.complete(__assign(__assign({}, base), { isAborted: true, reason: 'aborted' }))];
            case 5:
                _a.sent();
                (0, testing_1.expect)(calls).toBe(0);
                return [4 /*yield*/, $.command.run(__assign(__assign({}, COMMAND), { args: 'off' }))];
            case 6:
                _a.sent();
                return [4 /*yield*/, $.turn.complete(__assign(__assign({}, base), { reason: 'answer' }))];
            case 7:
                _a.sent();
                (0, testing_1.expect)(calls).toBe(0);
                return [2 /*return*/];
        }
    });
}); });
