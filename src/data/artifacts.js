export const ARTIFACTS = [
  { id: 'artifact_5',  name: '5 point Artifact',  copy: 1, total: 1 },
  { id: 'artifact_7',  name: '7 point Artifact',  copy: 1, total: 1 },
  { id: 'artifact_10', name: '10 point Artifact', copy: 1, total: 1 },
  { id: 'artifact_12', name: '12 point Artifact', copy: 1, total: 1 },
  { id: 'artifact_15', name: '15 point Artifact', copy: 1, total: 1 },
  { id: 'artifact_17', name: '17 point Artifact', copy: 1, total: 1 },
  { id: 'artifact_20', name: '20 point Artifact', copy: 1, total: 1 },
]

export const ARTIFACT_BY_ID = Object.fromEntries(ARTIFACTS.map((a) => [a.id, a]))
