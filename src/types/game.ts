export type GameId =
  | 'flappy'
  | 'puzzle'
  | 'restaurant'
  | 'school'
  | 'story'
  | 'memory'
  | 'music'
  | 'colors'

export type Game = {
  id: GameId
  title: string
  emoji: string
  color: string
  description: string
}
