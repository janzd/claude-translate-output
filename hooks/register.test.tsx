import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

const USAGE = {
  input_tokens: 1,
  output_tokens: 1,
  cache_read_input_tokens: 0,
  cache_creation_input_tokens: 0,
}
const stubEngine = (on: On) => {
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('command.register', async (_$, e) => ({ value: { command: e.name } }))
  mock.store(on)
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  on('ui.close', async () => ({ value: undefined }))
  on('ui.status', async () => ({ value: undefined }))
  on('turn.complete', async (_$, e) => ({ text: e.answer }))
}

const COMMAND = {
  command: 'translate',
  origin: { kind: 'composer' },
  presentation: { isFullscreen: false, columns: 160 },
} as const
const PANE = {
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
} as const

test('translates the final answer into the chosen language', async ($, on) => {
  const prompts: string[] = []
  on('model.complete', async (_$, e) => {
    prompts.push(e.prompt)
    return { value: { isAnswered: true, text: '**こんにちは**、世界', usage: USAGE } }
  })
  stubEngine(on)

  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.command.run({ ...COMMAND, args: 'Japanese' })

  const result = await $.turn.complete({
    answer: 'Hello, world',
    durationMs: 10,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
  })

  // The original answer is untouched; translation goes to the pane.
  expect(result.text).toBe('Hello, world')
  expect(prompts).toHaveLength(1)
  expect(prompts[0]).toContain('Japanese')
  expect(prompts[0]).toContain('Hello, world')

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ type: 'Markdown', text: /\*\*こんにちは\*\*/ })).toBeDefined()
    await ui.unmount()
  }
})

test('skips subagent turns, aborted turns and when off', async ($, on) => {
  let calls = 0
  on('model.complete', async () => {
    calls += 1
    return { value: { isAnswered: true, text: 'x', usage: USAGE } }
  })
  stubEngine(on)

  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  const base = { answer: 'Hi', durationMs: 1, isAborted: false, turnId: 't' }

  await $.turn.complete({ ...base, reason: 'answer' })
  expect(calls).toBe(0)

  await $.command.run({ ...COMMAND, args: 'French' })
  await $.turn.complete({ ...base, reason: 'answer', agentId: 'sub-1' })
  await $.turn.complete({ ...base, isAborted: true, reason: 'aborted' })
  expect(calls).toBe(0)

  await $.command.run({ ...COMMAND, args: 'off' })
  await $.turn.complete({ ...base, reason: 'answer' })
  expect(calls).toBe(0)
})

test('uses haiku by default and the model chosen with /translate model', async ($, on) => {
  const models: string[] = []
  on('model.complete', async (_$, e) => {
    models.push(e.model)
    return { value: { isAnswered: true, text: 'x', usage: USAGE } }
  })
  stubEngine(on)

  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.command.run({ ...COMMAND, args: 'German' })
  const turn = { answer: 'Hi', durationMs: 1, isAborted: false, turnId: 't' }

  await $.turn.complete({ ...turn, reason: 'answer' })
  const shown = await $.command.run({ ...COMMAND, args: 'model sonnet' })
  await $.turn.complete({ ...turn, reason: 'answer' })
  const current = await $.command.run({ ...COMMAND, args: 'model' })

  expect(models).toEqual(['haiku', 'sonnet'])
  expect(shown.text).toBe('Translation model set to sonnet.')
  expect(current.text).toBe('Translation model: sonnet.')
})

test('shows an error in the pane when the model request is refused', async ($, on) => {
  on('model.complete', async () => {
    throw new Error('unknown model')
  })
  stubEngine(on)

  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.command.run({ ...COMMAND, args: 'German' })
  await $.command.run({ ...COMMAND, args: 'model not-a-model' })
  await $.turn.complete({
    answer: 'Hi',
    durationMs: 1,
    isAborted: false,
    turnId: 't',
    reason: 'answer',
  })

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: /failed with model not-a-model/ })).toBeDefined()
  await ui.unmount()
})

test('uses low effort by default and the level chosen with /translate effort', async ($, on) => {
  const efforts: (string | undefined)[] = []
  on('model.complete', async (_$, e) => {
    efforts.push(e.effort)
    return { value: { isAnswered: true, text: 'x', usage: USAGE } }
  })
  stubEngine(on)

  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.command.run({ ...COMMAND, args: 'German' })
  const turn = { answer: 'Hi', durationMs: 1, isAborted: false, turnId: 't' }

  await $.turn.complete({ ...turn, reason: 'answer' })
  const rejected = await $.command.run({ ...COMMAND, args: 'effort extreme' })
  await $.command.run({ ...COMMAND, args: 'effort High' })
  await $.turn.complete({ ...turn, reason: 'answer' })
  const current = await $.command.run({ ...COMMAND, args: 'effort' })

  expect(efforts).toEqual(['low', 'high'])
  expect(rejected.text).toContain('Unknown effort "extreme"')
  expect(current.text).toBe('Translation effort: high.')
})
