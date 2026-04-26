import { create } from 'zustand'

export type VideoAnnotation = {
  id: number
  time: number
  text: string
}

export type SavedFormVideo = {
  id: number
  url: string
  date: string
  duration: number
  annotations: VideoAnnotation[]
  sentToCoach: boolean
  title: string
}

type AthleteMediaState = {
  videos: SavedFormVideo[]
  addVideo: (video: SavedFormVideo) => void
  removeVideo: (id: number) => void
}

export const useAthleteMediaStore = create<AthleteMediaState>((set) => ({
  videos: [],
  addVideo: (video) =>
    set((s) => ({
      videos: [video, ...s.videos],
    })),
  removeVideo: (id) =>
    set((s) => ({
      videos: s.videos.filter((v) => v.id !== id),
    })),
}))
