import { atom, read, update } from 'claude-code'
import type { EngineInterface, ModelEffort, Register } from 'claude-code'

import type { Translation } from '../types'

const PANE = 'translate-output'
const STORE_KEY = 'language'
const MODEL_STORE_KEY = 'model'
const DEFAULT_MODEL = 'haiku'
const EFFORT_STORE_KEY = 'effort'
const DEFAULT_EFFORT: ModelEffort = 'low'
const EFFORTS: readonly ModelEffort[] = ['low', 'medium', 'high', 'xhigh', 'max']

const language = atom({ plugin: 'translate-output', key: 'language' } as const, null)
const latest = atom({ plugin: 'translate-output', key: 'latest' } as const, null)

const USAGE = [
  'Usage:',
  '  /translate <language>   turn on, translating final answers into <language>',
  '  /translate off          turn off',
  '  /translate model <name> translate with <name> (haiku, sonnet, opus or a model id)',
  '  /translate model        show the model in use',
  '  /translate effort <level> set effort: low, medium, high, xhigh or max',
  '  /translate effort       show the effort in use',
  '  /translate              show the current setting and open the pane',
].join('\n')

function translationPrompt(target: string, answer: string): string {
  return [
    `Translate the text inside <text> into ${target}.`,
    'Keep Markdown formatting, code blocks, file paths, commands and identifiers',
    'exactly as they are. Reply with the translation only, no preamble.',
    '',
    `<text>\n${answer}\n</text>`,
  ].join('\n')
}

function displayOnlyNote(target: string): string {
  return [
    `The translate-output plugin now shows a ${target} translation of your final`,
    'answers in a separate pane, on its own. This is display-only and does not',
    'change how you respond: keep answering in the language you would otherwise',
    'use, and do not translate your answers yourself.',
  ].join(' ')
}

async function translationModel($: EngineInterface): Promise<string> {
  const stored = await $.store.get(MODEL_STORE_KEY)

  return typeof stored === 'string' ? stored : DEFAULT_MODEL
}

async function translationEffort($: EngineInterface): Promise<ModelEffort> {
  const stored = await $.store.get(EFFORT_STORE_KEY)

  return EFFORTS.find(level => level === stored) ?? DEFAULT_EFFORT
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'translate',
      description:
        'Translate final answers: /translate <language> | off | model <name> | effort <level>',
    })
    // The chosen language persists across sessions; mirror it into session state.
    const stored = await $.store.get(STORE_KEY)
    await update($, language, () => (typeof stored === 'string' ? stored : null))

    return next(e)
  })

  on('command.run', { command: 'translate' }, async ($, e) => {
    const arg = e.args.trim()
    const modelArg = /^model(?:\s+(.*))?$/i.exec(arg)

    if (modelArg !== null) {
      const requested = modelArg[1]?.trim() ?? ''
      if (requested === '') {
        return { text: `Translation model: ${await translationModel($)}.` }
      }
      await $.store.set(MODEL_STORE_KEY, requested)

      return { text: `Translation model set to ${requested}.` }
    }

    const effortArg = /^effort(?:\s+(.*))?$/i.exec(arg)

    if (effortArg !== null) {
      const requested = effortArg[1]?.trim().toLowerCase() ?? ''
      if (requested === '') {
        return { text: `Translation effort: ${await translationEffort($)}.` }
      }
      const effort = EFFORTS.find(level => level === requested)
      if (effort === undefined) {
        return { text: `Unknown effort "${requested}". Use one of: ${EFFORTS.join(', ')}.` }
      }
      await $.store.set(EFFORT_STORE_KEY, effort)

      return { text: `Translation effort set to ${effort}.` }
    }

    if (arg === '') {
      const current = await read($, language)
      if (current === null) {
        return { text: `Translation is off.\n${USAGE}` }
      }
      await $.ui.open({ id: PANE, title: `Translation (${current})` })

      return { text: `Translating final answers into ${current}.` }
    }

    if (arg.toLowerCase() === 'off') {
      await $.store.delete(STORE_KEY)
      await update($, language, () => null)
      await update($, latest, () => null)
      await $.ui.close({ id: PANE })

      return { text: 'Translation turned off.' }
    }

    await $.store.set(STORE_KEY, arg)
    await update($, language, () => arg)
    await $.ui.open({ id: PANE, title: `Translation (${arg})` })

    return {
      text: `Translation pane on: final answers are shown translated into ${arg}.`,
      // The model reads command output; without this it may start answering in
      // the chosen language itself.
      context: [displayOnlyNote(arg)],
    }
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    const target = await read($, language)
    // Main loop only (subagents carry an agentId), and only a real final answer.
    const isFinalAnswer =
      e.agentId === undefined && e.reason === 'answer' && e.answer.trim() !== ''

    if (target === null || !isFinalAnswer) {
      return result
    }

    const pending: Translation = { language: target, text: '', status: 'translating' }
    await update($, latest, () => pending)
    $.ui.status(`Translating to ${target}…`)

    const model = await translationModel($)
    const effort = await translationEffort($)
    let done: Translation
    try {
      const reply = await $.model.complete({
        model,
        prompt: translationPrompt(target, e.answer),
        maxTokens: 16000,
        effort,
        timeoutMs: 120000,
      })
      done = reply.isAnswered
        ? { language: target, text: reply.text, status: 'done' }
        : { language: target, text: `Translation failed (${reply.reason}).`, status: 'error' }
    } catch (error) {
      // The engine refuses to send a request for a model it does not know or allow.
      const reason = error instanceof Error ? error.message : String(error)
      const text = `Translation failed with model ${model}: ${reason}`
      done = { language: target, text, status: 'error' }
    }
    await update($, latest, () => done)
    $.ui.status(undefined)

    return result
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Markdown, Text } = $.ui.resolve(e)
    const target = await read($, language)
    const translation = await read($, latest)

    if (target === null) {
      return (
        <Box flexDirection="column">
          <Text dimColor>Translation is off. Turn it on with /translate &lt;language&gt;.</Text>
        </Box>
      )
    }

    if (translation === null) {
      return (
        <Box flexDirection="column">
          <Text dimColor>The next final answer will be translated into {target}.</Text>
        </Box>
      )
    }

    if (translation.status === 'translating') {
      return (
        <Box flexDirection="column">
          <Text dimColor>Translating into {translation.language}…</Text>
        </Box>
      )
    }

    if (translation.status === 'error') {
      return (
        <Box flexDirection="column">
          <Text color="red">{translation.text}</Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        <Markdown text={translation.text} />
      </Box>
    )
  })
}
