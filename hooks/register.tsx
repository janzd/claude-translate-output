import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Translation } from '../types'

const PANE = 'translate-output'
const STORE_KEY = 'language'
const MODEL = 'haiku'

const language = atom({ plugin: 'translate-output', key: 'language' } as const, null)
const latest = atom({ plugin: 'translate-output', key: 'latest' } as const, null)

const USAGE = [
  'Usage:',
  '  /translate <language>   turn on, translating final answers into <language>',
  '  /translate off          turn off',
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

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'translate',
      description: 'Translate final answers: /translate <language> | off',
    })
    // The chosen language persists across sessions; mirror it into session state.
    const stored = await $.store.get(STORE_KEY)
    await update($, language, () => (typeof stored === 'string' ? stored : null))

    return next(e)
  })

  on('command.run', { command: 'translate' }, async ($, e) => {
    const arg = e.args.trim()

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

    return { text: `Translation on: final answers will be translated into ${arg}.` }
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

    const reply = await $.model.complete({
      model: MODEL,
      prompt: translationPrompt(target, e.answer),
      maxTokens: 16000,
      effort: 'low',
      timeoutMs: 120000,
    })

    const done: Translation = reply.isAnswered
      ? { language: target, text: reply.text, status: 'done' }
      : { language: target, text: `Translation failed (${reply.reason}).`, status: 'error' }
    await update($, latest, () => done)
    $.ui.status(undefined)

    return result
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
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

    return (
      <Box flexDirection="column">
        <Text color={translation.status === 'error' ? 'red' : undefined}>
          {translation.text}
        </Text>
      </Box>
    )
  })
}
