import { MarkerType } from '@xyflow/react'

export function generateEventId(events) {
  const nums = events
    .map((e) => parseInt(e.event_id?.replace('EVT-', ''), 10))
    .filter((n) => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `EVT-${String(max + 1).padStart(3, '0')}`
}

export function wouldCreateCycle(sourceId, targetId, edges) {
  const visited = new Set()
  const stack = [targetId]
  while (stack.length > 0) {
    const current = stack.pop()
    if (current === sourceId) return true
    if (visited.has(current)) continue
    visited.add(current)
    edges.filter((e) => e.source === current).forEach((e) => stack.push(e.target))
  }
  return false
}

export function isValidConnection(params, nodes, edges) {
  const { source, target } = params
  if (source === target) return false
  const sourceNode = nodes.find((n) => n.id === source)
  const targetNode = nodes.find((n) => n.id === target)
  if (!sourceNode || !targetNode) return false
  if (sourceNode.data.category === 'ESCAPE') return false
  if (targetNode.data.category === 'ESCAPE' && sourceNode.data.category !== 'MAIN-QUEST') return false
  if (wouldCreateCycle(source, target, edges)) return false
  return true
}

function categoryToNodeType(category) {
  return { 'MAIN-QUEST': 'mainQuest', 'SIDE-QUEST': 'sideQuest', 'ROUND-END': 'roundEnd', 'ESCAPE': 'escape' }[category] ?? 'mainQuest'
}

export function eventsToNodes(events) {
  return events.map((event) => ({
    id: event.event_id,
    type: categoryToNodeType(event.category),
    position: event.position ?? { x: 100, y: 100 },
    data: {
      category: event.category,
      name: event.name ?? '',
      remainder_text: event.remainder_text ?? '',
      event_completion_text: event.event_completion_text ?? '',
      choices: event.choices ?? [],
    },
    deletable: event.category !== 'ESCAPE',
  }))
}

export function eventsToEdges(events) {
  const edges = []
  for (const event of events) {
    for (const reqId of (event.required_event_ids ?? [])) {
      edges.push({
        id: `${reqId}->${event.event_id}`,
        source: reqId,
        target: event.event_id,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      })
    }
  }
  return edges
}

export function flowDataToEvents(rfNodes, rfEdges, existingEvents) {
  return rfNodes.map((node) => {
    const existing = existingEvents.find((e) => e.event_id === node.id) ?? {}
    const required_event_ids = rfEdges.filter((e) => e.target === node.id).map((e) => e.source)
    return {
      ...existing,
      event_id: node.id,
      category: node.data.category,
      name: node.data.name ?? '',
      remainder_text: node.data.remainder_text ?? '',
      event_completion_text: node.data.event_completion_text ?? '',
      choices: node.data.choices ?? [],
      required_event_ids,
      position: node.position,
    }
  })
}

export function createEscapeEvent() {
  return {
    event_id: 'EVT-ESCAPE',
    category: 'ESCAPE',
    required_event_ids: [],
    name: 'Escape',
    remainder_text: '',
    event_completion_text: '',
    choices: [],
    position: { x: 400, y: 500 },
  }
}

export function hasValidEscapePath(rfNodes, rfEdges) {
  const escapeNode = rfNodes.find((n) => n.data.category === 'ESCAPE')
  if (!escapeNode) return false
  return rfNodes.some(
    (n) => n.data.category === 'MAIN-QUEST' &&
           rfEdges.some((e) => e.source === n.id && e.target === escapeNode.id)
  )
}
