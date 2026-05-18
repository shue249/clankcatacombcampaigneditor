import React, { useState } from 'react'
import { CardPickerModal } from './CardPickerModal'
import { TokenPickerModal } from './TokenPickerModal'
import { CARD_BY_ID } from '../data/cards'
import { TOKEN_BY_ID } from '../data/tokens'

const inputClass = 'w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const labelClass = 'block text-sm text-gray-300 mb-1'
const sectionClass = 'rounded-lg border border-gray-700 p-5 flex flex-col gap-4'
const headingClass = 'text-sm font-semibold text-gray-400 uppercase tracking-widest'

function toList(str) {
  return str.split('\n').map((s) => s.trim()).filter(Boolean)
}

function groupChips(ids, byId) {
  const groups = new Map()
  for (const id of ids) {
    const name = byId[id]?.name ?? id
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(id)
  }
  return [...groups.entries()].map(([name, ids]) => ({ name, ids, count: ids.length }))
}

function TokenChips({ tokens, byId, onRemove }) {
  if (tokens.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {groupChips(tokens, byId).map(({ name, ids, count }) => (
        <span key={name} className="flex items-center gap-1.5 bg-gray-700 rounded px-2.5 py-1 text-sm text-white">
          {count > 1 ? `${name} ×${count}` : name}
          <button
            aria-label={`Remove ${name}`}
            onClick={() => onRemove(ids)}
            className="text-gray-400 hover:text-white transition-colors leading-none"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}

export function SetupTab({ chapter, onUpdate }) {
  const [startingMap, setStartingMap] = useState(chapter.starting_map ?? '')
  const [startingArtifacts, setStartingArtifacts] = useState((chapter.starting_artifacts ?? []).join('\n'))
  const [startingTokens, setStartingTokens] = useState(chapter.starting_tokens ?? [])
  const [showStartingTokenPicker, setShowStartingTokenPicker] = useState(false)
  const [tileDeck, setTileDeck] = useState((chapter.tile_deck ?? []).join('\n'))

  const [playerClank, setPlayerClank] = useState(chapter.player_clank ?? 3)
  const [rivalClank, setRivalClank] = useState(chapter.rival_clank ?? 3)
  const [dragonClank, setDragonClank] = useState(chapter.dragon_clank ?? 0)
  const [ghostClank, setGhostClank] = useState(chapter.ghost_clank ?? 0)
  const [playerClankHard, setPlayerClankHard] = useState(chapter.player_clank_hard ?? 3)
  const [rivalClankHard, setRivalClankHard] = useState(chapter.rival_clank_hard ?? 3)
  const [dragonClankHard, setDragonClankHard] = useState(chapter.dragon_clank_hard ?? 4)
  const [ghostClankHard, setGhostClankHard] = useState(chapter.ghost_clank_hard ?? 0)
  const [playerClankBrutal, setPlayerClankBrutal] = useState(chapter.player_clank_brutal ?? 3)
  const [rivalClankBrutal, setRivalClankBrutal] = useState(chapter.rival_clank_brutal ?? 3)
  const [dragonClankBrutal, setDragonClankBrutal] = useState(chapter.dragon_clank_brutal ?? 6)
  const [ghostClankBrutal, setGhostClankBrutal] = useState(chapter.ghost_clank_brutal ?? 1)

  const [rageTrack, setRageTrack] = useState(chapter.rage_track ?? 3)
  const [setAsideCards, setSetAsideCards] = useState(chapter.set_aside_cards ?? [])
  const [showCardPicker, setShowCardPicker] = useState(false)
  const [setAsideTokens, setSetAsideTokens] = useState(chapter.set_aside_tokens ?? [])
  const [showSetAsideTokenPicker, setShowSetAsideTokenPicker] = useState(false)
  const [instructions, setInstructions] = useState(chapter.instructions ?? '')

  function handleTextBlur(field, value, original) {
    if (value === original) return
    onUpdate({ [field]: value })
  }

  function handleListBlur(field, value, original) {
    const list = toList(value)
    if (JSON.stringify(list) === JSON.stringify(original)) return
    onUpdate({ [field]: list })
  }

  function handleIntBlur(field, value, original) {
    const parsed = isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10)
    if (parsed === original) return
    onUpdate({ [field]: parsed })
  }

  const clankRows = [
    { label: 'Player Clank', values: [playerClank, playerClankHard, playerClankBrutal], setters: [setPlayerClank, setPlayerClankHard, setPlayerClankBrutal], fields: ['player_clank', 'player_clank_hard', 'player_clank_brutal'], origs: [chapter.player_clank ?? 3, chapter.player_clank_hard ?? 3, chapter.player_clank_brutal ?? 3] },
    { label: 'Rival Clank',  values: [rivalClank,  rivalClankHard,  rivalClankBrutal],  setters: [setRivalClank,  setRivalClankHard,  setRivalClankBrutal],  fields: ['rival_clank',  'rival_clank_hard',  'rival_clank_brutal'],  origs: [chapter.rival_clank ?? 3, chapter.rival_clank_hard ?? 3, chapter.rival_clank_brutal ?? 3] },
    { label: 'Dragon Clank', values: [dragonClank, dragonClankHard, dragonClankBrutal], setters: [setDragonClank, setDragonClankHard, setDragonClankBrutal], fields: ['dragon_clank', 'dragon_clank_hard', 'dragon_clank_brutal'], origs: [chapter.dragon_clank ?? 0, chapter.dragon_clank_hard ?? 4, chapter.dragon_clank_brutal ?? 6] },
    { label: 'Ghost Clank',  values: [ghostClank,  ghostClankHard,  ghostClankBrutal],  setters: [setGhostClank,  setGhostClankHard,  setGhostClankBrutal],  fields: ['ghost_clank',  'ghost_clank_hard',  'ghost_clank_brutal'],  origs: [chapter.ghost_clank ?? 0, chapter.ghost_clank_hard ?? 0, chapter.ghost_clank_brutal ?? 1] },
  ]
  const difficulties = ['Normal', 'Hard', 'Brutal']

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Group 1 — Map */}
      <section className={sectionClass}>
        <h3 className={headingClass}>Map</h3>
        <div>
          <label htmlFor="setup-starting-map" className={labelClass}>Starting Map</label>
          <textarea
            id="setup-starting-map"
            rows={3}
            value={startingMap}
            onChange={(e) => setStartingMap(e.target.value)}
            onBlur={() => handleTextBlur('starting_map', startingMap, chapter.starting_map ?? '')}
            placeholder="Describe the starting map layout..."
            className={inputClass + ' resize-none'}
          />
        </div>

        {/* Starting Artifacts — free text */}
        <div>
          <label htmlFor="setup-starting-artifacts" className={labelClass}>Starting Artifacts</label>
          <textarea
            id="setup-starting-artifacts"
            rows={3}
            value={startingArtifacts}
            onChange={(e) => setStartingArtifacts(e.target.value)}
            onBlur={() => handleListBlur('starting_artifacts', startingArtifacts, chapter.starting_artifacts ?? [])}
            placeholder="One item per line"
            className={inputClass + ' resize-none'}
          />
        </div>

        {/* Starting Tokens — token picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={labelClass}>Starting Tokens</span>
            <button
              onClick={() => setShowStartingTokenPicker(true)}
              className="text-xs px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Add Tokens
            </button>
          </div>
          <TokenChips
            tokens={startingTokens}
            byId={TOKEN_BY_ID}
            onRemove={(ids) => {
              const updated = startingTokens.filter((id) => !ids.includes(id))
              setStartingTokens(updated)
              onUpdate({ starting_tokens: updated })
            }}
          />
        </div>

        {/* Tile Deck — free text */}
        <div>
          <label htmlFor="setup-tile-deck" className={labelClass}>Tile Deck</label>
          <textarea
            id="setup-tile-deck"
            rows={3}
            value={tileDeck}
            onChange={(e) => setTileDeck(e.target.value)}
            onBlur={() => handleListBlur('tile_deck', tileDeck, chapter.tile_deck ?? [])}
            placeholder="One item per line"
            className={inputClass + ' resize-none'}
          />
        </div>
      </section>

      {/* Group 2 — Difficulty */}
      <section className={sectionClass}>
        <h3 className={headingClass}>Difficulty</h3>
        <div className="grid grid-cols-4 gap-x-4 gap-y-2 items-center">
          <div />
          {difficulties.map((d) => (
            <div key={d} className="text-xs font-semibold text-center text-gray-400 uppercase tracking-wide pb-1">
              {d}
            </div>
          ))}
          {clankRows.map(({ label, values, setters, fields, origs }) => (
            <React.Fragment key={label}>
              <div className="text-sm text-gray-300">{label}</div>
              {difficulties.map((diff, i) => (
                <input
                  key={diff}
                  type="number"
                  min={0}
                  aria-label={`${label} ${diff}`}
                  value={values[i]}
                  onChange={(e) => setters[i](e.target.value)}
                  onBlur={() => handleIntBlur(fields[i], values[i], origs[i])}
                  className={inputClass + ' text-center'}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Group 3 — Dragon Rage Track */}
      <section className={sectionClass}>
        <h3 className={headingClass}>Dragon Rage Track</h3>
        <div className="max-w-xs">
          <label htmlFor="setup-rage-track" className={labelClass}>Rage Track</label>
          <input
            id="setup-rage-track"
            type="number"
            min={0}
            value={rageTrack}
            onChange={(e) => setRageTrack(e.target.value)}
            onBlur={() => handleIntBlur('rage_track', rageTrack, chapter.rage_track ?? 3)}
            className={inputClass}
          />
        </div>
      </section>

      {/* Group 4 — Set Aside */}
      <section className={sectionClass}>
        <h3 className={headingClass}>Set Aside</h3>

        {/* Set Aside Cards — card picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={labelClass}>Set Aside Cards</span>
            <button
              onClick={() => setShowCardPicker(true)}
              className="text-xs px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Add Cards
            </button>
          </div>
          <TokenChips
            tokens={setAsideCards}
            byId={CARD_BY_ID}
            onRemove={(ids) => {
              const updated = setAsideCards.filter((id) => !ids.includes(id))
              setSetAsideCards(updated)
              onUpdate({ set_aside_cards: updated })
            }}
          />
        </div>

        {/* Set Aside Tokens — token picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={labelClass}>Set Aside Tokens</span>
            <button
              onClick={() => setShowSetAsideTokenPicker(true)}
              className="text-xs px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Add Tokens
            </button>
          </div>
          <TokenChips
            tokens={setAsideTokens}
            byId={TOKEN_BY_ID}
            onRemove={(ids) => {
              const updated = setAsideTokens.filter((id) => !ids.includes(id))
              setSetAsideTokens(updated)
              onUpdate({ set_aside_tokens: updated })
            }}
          />
        </div>
      </section>

      {/* Group 5 — Starting Instructions */}
      <section className={sectionClass}>
        <h3 className={headingClass}>Starting Instructions</h3>
        <div>
          <label htmlFor="setup-instructions" className={labelClass}>Instructions</label>
          <textarea
            id="setup-instructions"
            rows={12}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            onBlur={() => handleTextBlur('instructions', instructions, chapter.instructions ?? '')}
            placeholder="Chapter start instructions shown to the player..."
            className={inputClass + ' resize-none'}
          />
        </div>
      </section>

      {showCardPicker && (
        <CardPickerModal
          selectedCards={setAsideCards}
          onDone={(cards) => { setSetAsideCards(cards); setShowCardPicker(false); onUpdate({ set_aside_cards: cards }) }}
          onCancel={() => setShowCardPicker(false)}
        />
      )}

      {showStartingTokenPicker && (
        <TokenPickerModal
          title="Starting Tokens"
          selectedTokens={startingTokens}
          onDone={(tokens) => { setStartingTokens(tokens); setShowStartingTokenPicker(false); onUpdate({ starting_tokens: tokens }) }}
          onCancel={() => setShowStartingTokenPicker(false)}
        />
      )}

      {showSetAsideTokenPicker && (
        <TokenPickerModal
          title="Set Aside Tokens"
          selectedTokens={setAsideTokens}
          onDone={(tokens) => { setSetAsideTokens(tokens); setShowSetAsideTokenPicker(false); onUpdate({ set_aside_tokens: tokens }) }}
          onCancel={() => setShowSetAsideTokenPicker(false)}
        />
      )}

    </div>
  )
}
