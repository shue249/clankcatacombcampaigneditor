import { useCallback, useState, useRef, createContext, useContext } from 'react'
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Background,
  MiniMap,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { EventDetailPopup } from './EventDetailPopup'
import { ConfirmDialog } from './ConfirmDialog'
import {
  generateEventId,
  isValidConnection,
  eventsToNodes,
  eventsToEdges,
  flowDataToEvents,
  createEscapeEvent,
  hasValidEscapePath,
} from '../utils/eventUtils'

// ── Node delete context ──────────────────────────────────────────────────────

const NodeActionsContext = createContext(null)

// ── Category styles ──────────────────────────────────────────────────────────

const STYLES = {
  'MAIN-QUEST': { border: 'border-blue-500',    bg: 'bg-blue-950/60',    label: 'text-blue-400',    badge: 'bg-blue-600' },
  'SIDE-QUEST': { border: 'border-green-500',   bg: 'bg-green-950/60',   label: 'text-green-400',   badge: 'bg-green-600' },
  'ROUND-END':  { border: 'border-orange-500',  bg: 'bg-orange-950/60',  label: 'text-orange-400',  badge: 'bg-orange-600' },
  'ESCAPE':     { border: 'border-emerald-400 border-2', bg: 'bg-emerald-950/60', label: 'text-emerald-400', badge: 'bg-emerald-600' },
}

// ── Custom node component ────────────────────────────────────────────────────

function EventNode({ id, data, selected }) {
  const actions = useContext(NodeActionsContext)
  const s = STYLES[data.category] ?? STYLES['MAIN-QUEST']

  return (
    <div
      className={`min-w-[160px] rounded-lg border ${s.border} ${s.bg} px-4 py-3 shadow-lg relative ${selected ? 'ring-2 ring-white/60' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-500 !w-2.5 !h-2.5" />

      <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${s.label}`}>{data.category}</div>
      <div className="text-sm text-white font-medium leading-snug min-h-[1.25rem]">
        {data.name || <span className="text-gray-500 italic">Unnamed</span>}
      </div>
      {data.count > 1 && (
        <span className={`mt-1.5 inline-block text-xs text-white px-1.5 py-0.5 rounded ${s.badge}`}>
          ×{data.count}
        </span>
      )}

      {selected && data.category !== 'ESCAPE' && (
        <button
          aria-label="Delete event"
          onClick={(e) => { e.stopPropagation(); actions?.requestDelete(id, data.name) }}
          className="nodrag nopan absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors text-base leading-none"
        >
          ✕
        </button>
      )}

      {data.category !== 'ESCAPE' && (
        <Handle type="source" position={Position.Bottom} className="!bg-gray-500 !w-2.5 !h-2.5" />
      )}
    </div>
  )
}

const nodeTypes = {
  mainQuest: EventNode,
  sideQuest: EventNode,
  roundEnd:  EventNode,
  escape:    EventNode,
}

// ── Toolbar items ────────────────────────────────────────────────────────────

const TOOLBAR_ITEMS = [
  { category: 'MAIN-QUEST', color: 'bg-blue-600 hover:bg-blue-500',   ring: 'focus:ring-blue-400' },
  { category: 'SIDE-QUEST', color: 'bg-green-600 hover:bg-green-500', ring: 'focus:ring-green-400' },
  { category: 'ROUND-END',  color: 'bg-orange-600 hover:bg-orange-500', ring: 'focus:ring-orange-400' },
]

function categoryToNodeType(category) {
  return { 'MAIN-QUEST': 'mainQuest', 'SIDE-QUEST': 'sideQuest', 'ROUND-END': 'roundEnd', 'ESCAPE': 'escape' }[category] ?? 'mainQuest'
}

// ── EventsTab ────────────────────────────────────────────────────────────────

export function EventsTab({ chapter, onUpdate }) {
  const initialEvents = (() => {
    const evts = chapter.events ?? []
    return evts.find((e) => e.category === 'ESCAPE') ? evts : [...evts, createEscapeEvent()]
  })()

  const [nodes, setNodes, onNodesChange] = useNodesState(eventsToNodes(initialEvents))
  const [edges, setEdges, onEdgesChange] = useEdgesState(eventsToEdges(initialEvents))

  const [popup, setPopup]         = useState(null)   // { category, nodeId, initialData, isNew }
  const [deleteTarget, setDeleteTarget] = useState(null) // { nodeId, nodeName }
  const [rfInstance, setRfInstance] = useState(null)
  const wrapperRef = useRef(null)

  // ── Persist ──────────────────────────────────────────────────────────────

  function persist(newNodes, newEdges) {
    onUpdate({ events: flowDataToEvents(newNodes, newEdges, chapter.events ?? []) })
  }

  // ── Drag from toolbar ────────────────────────────────────────────────────

  function onDragStart(e, category) {
    e.dataTransfer.setData('application/clank-event-category', category)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function onDrop(e) {
    e.preventDefault()
    const category = e.dataTransfer.getData('application/clank-event-category')
    if (!category || !rfInstance) return

    const position = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    const allEvents = flowDataToEvents(nodes, edges, chapter.events ?? [])
    const newId = generateEventId(allEvents)

    const tempNode = {
      id: newId,
      type: categoryToNodeType(category),
      position,
      data: { category, name: '', count: 1, remainder_text: '', event_completion_text: [''] },
      deletable: true,
    }

    setNodes((nds) => [...nds, tempNode])
    setPopup({ category, nodeId: newId, initialData: null, isNew: true })
  }

  // ── Popup handlers ───────────────────────────────────────────────────────

  function handlePopupSave(eventData) {
    const { nodeId } = popup
    setNodes((nds) => {
      const updated = nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...eventData } } : n)
      persist(updated, edges)
      return updated
    })
    setPopup(null)
  }

  function handlePopupCancel() {
    if (popup?.isNew) {
      setNodes((nds) => nds.filter((n) => n.id !== popup.nodeId))
    }
    setPopup(null)
  }

  // ── Node double-click → edit ─────────────────────────────────────────────

  function onNodeDoubleClick(_, node) {
    if (node.data.category === 'ESCAPE') return
    setPopup({ category: node.data.category, nodeId: node.id, initialData: node.data, isNew: false })
  }

  // ── Connections ──────────────────────────────────────────────────────────

  const onConnect = useCallback((params) => {
    if (!isValidConnection(params, nodes, edges)) return
    const newEdge = { ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } }
    setEdges((eds) => {
      const updated = addEdge(newEdge, eds)
      persist(nodes, updated)
      return updated
    })
  }, [nodes, edges])

  // ── Node drag-stop → save positions ─────────────────────────────────────

  function onNodeDragStop() {
    setNodes((nds) => { persist(nds, edges); return nds })
  }

  // ── Delete with confirmation ─────────────────────────────────────────────

  const nodeActions = {
    requestDelete: (nodeId, nodeName) => setDeleteTarget({ nodeId, nodeName }),
  }

  function confirmDeleteNode() {
    const { nodeId } = deleteTarget
    const updatedNodes = nodes.filter((n) => n.id !== nodeId)
    const updatedEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
    setNodes(updatedNodes)
    setEdges(updatedEdges)
    persist(updatedNodes, updatedEdges)
    setDeleteTarget(null)
  }

  // ── Edge changes (captures deletions) ────────────────────────────────────

  function handleEdgesChange(changes) {
    onEdgesChange(changes)
    const hasRemove = changes.some((c) => c.type === 'remove')
    if (hasRemove) {
      setEdges((eds) => { persist(nodes, eds); return eds })
    }
  }

  // ── Validation banner ────────────────────────────────────────────────────

  const isValid = hasValidEscapePath(nodes, edges)

  return (
    <NodeActionsContext.Provider value={nodeActions}>
      <div className="flex flex-col h-full gap-3" style={{ minHeight: 600 }}>

        {/* Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500 uppercase tracking-widest mr-1">Drag to canvas:</span>
          {TOOLBAR_ITEMS.map(({ category, color, ring }) => (
            <div
              key={category}
              draggable
              onDragStart={(e) => onDragStart(e, category)}
              className={`cursor-grab active:cursor-grabbing px-3 py-1.5 rounded text-xs font-bold text-white uppercase tracking-wide select-none ${color} focus:outline-none focus:ring-2 ${ring}`}
            >
              {category}
            </div>
          ))}
        </div>

        {/* Validation banner */}
        {!isValid && nodes.length > 1 && (
          <div className="text-xs text-orange-400 bg-orange-900/30 border border-orange-700 rounded px-3 py-2 shrink-0">
            Connect at least one MAIN-QUEST event directly to ESCAPE before saving.
          </div>
        )}

        {/* Canvas */}
        <div ref={wrapperRef} className="flex-1 rounded-lg border border-gray-700 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            deleteKeyCode={null}
            fitView
            fitViewOptions={{ padding: 0.3 }}
          >
            <Background color="#374151" gap={20} />
            <MiniMap
              nodeColor={(n) => ({
                'MAIN-QUEST': '#2563eb',
                'SIDE-QUEST': '#16a34a',
                'ROUND-END':  '#ea580c',
                'ESCAPE':     '#10b981',
              }[n.data?.category] ?? '#6b7280')}
              maskColor="rgba(17,24,39,0.7)"
            />
          </ReactFlow>
        </div>

      </div>

      {/* Event detail popup */}
      {popup && (
        <EventDetailPopup
          category={popup.category}
          initialData={popup.initialData}
          onSave={handlePopupSave}
          onCancel={handlePopupCancel}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.nodeName || 'this event'}"? This will also remove all connected edges.`}
          onConfirm={confirmDeleteNode}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </NodeActionsContext.Provider>
  )
}
