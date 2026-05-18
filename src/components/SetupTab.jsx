import React, { useState } from 'react'
import { CardPickerModal } from './CardPickerModal'
import { CARD_BY_ID } from '../data/cards'

const inputClass = 'w-full rounded bg-gray-700 border border-gray-600 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const labelClass = 'block text-sm text-gray-300 mb-1'
const sectionClass = 'rounded-lg border border-gray-700 p-5 flex flex-col gap-4'
const headingClass = 'text-sm font-semibold text-gray-400 uppercase tracking-widest'

function toList(str) {
  return str.split('\n').map((s) => s.trim()).filter(Boolean)
}

function groupCardChips(cardIds) {
  const groups = new Map()
  for (const id of cardIds) {
    const name = CARD_BY_ID[id]?.name ?? id
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(id)
  }
  return [...groups.entries()].map(([name, ids]) => ({ name, ids, count: ids.length }))
}

export function SetupTab({ chapter, onUpdate }) {
  const [startingMap, setStartingMap] = useState(chapter.starting_map ?? '')
  const [startingArtifacts, setStartingArtifacts] = useState((chapter.starting_artifacts ?? []).join('\n'))
  const [startingTokens, setStartingTokens] = useState((chapter.starting_tokens ?? []).join('\n'))
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
  const [setAsideTokens, setSetAsideTokens] = useState((chapter.set_aside_tokens ?? []).join('\n'))
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
        {[
          { id: 'setup-starting-artifacts', label: 'Starting Artifacts', value: startingArtifacts, set: setStartingArtifacts, field: 'starting_artifacts', orig: chapter.starting_artifacts ?? [] },
          { id: 'setup-starting-tokens',    label: 'Starting Tokens',    value: startingTokens,    set: setStartingTokens,    field: 'starting_tokens',    orig: chapter.starting_tokens ?? [] },
          { id: 'setup-tile-deck',          label: 'Tile Deck',          value: tileDeck,          set: setTileDeck,          field: 'tile_deck',          orig: chapter.tile_deck ?? [] },
        ].map(({ id, label, value, set, field, orig }) => (
          <div key={id}>
            <label htmlFor={id} className={labelClass}>{label}</label>
            <textarea
              id={id}
              rows={3}
              value={value}
              onChange={(e) => set(e.target.value)}
              onBlur={() => handleListBlur(field, value, orig)}
              placeholder="One item per line"
              className={inputClass + ' resize-none'}
            />
          </div>
        ))}
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
          {setAsideCards.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {groupCardChips(setAsideCards).map(({ name, ids, count }) => (
                <span key={name} className="flex items-center gap-1.5 bg-gray-700 rounded px-2.5 py-1 text-sm text-white">
                  {count > 1 ? `${name} ×${count}` : name}
                  <button
                    aria-label={`Remove ${name}`}
                    onClick={() => {
                      const updated = setAsideCards.filter((id) => !ids.includes(id))
                      setSetAsideCards(updated)
                      onUpdate({ set_aside_cards: updated })
                    }}
                    className="text-gray-400 hover:text-white transition-colors leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Set Aside Tokens — free-text textarea */}
        <div>
          <label htmlFor="setup-set-aside-tokens" className={labelClass}>Set Aside Tokens</label>
          <textarea
            id="setup-set-aside-tokens"
            rows={3}
            value={setAsideTokens}
            onChange={(e) => setSetAsideTokens(e.target.value)}
            onBlur={() => handleListBlur('set_aside_tokens', setAsideTokens, chapter.set_aside_tokens ?? [])}
            placeholder="One item per line"
            className={inputClass + ' resize-none'}
          />
        </div>
      </section>

      {showCardPicker && (
        <CardPickerModal
          selectedCards={setAsideCards}
          onDone={(cards) => {
            setSetAsideCards(cards)
            setShowCardPicker(false)
            onUpdate({ set_aside_cards: cards })
          }}
          onCancel={() => setShowCardPicker(false)}
        />
      )}

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

    </div>
  )
}
