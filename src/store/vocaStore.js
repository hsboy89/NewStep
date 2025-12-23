import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useVocaStore = create(
  persist(
    (set, get) => ({
      words: [], // [{ word, meaning, pronunciation, example, savedAt }]

      addWord: (wordData) => {
        const words = get().words
        const exists = words.find(w => w.word.toLowerCase() === wordData.word.toLowerCase())
        if (!exists) {
          set({ 
            words: [...words, { 
              ...wordData, 
              savedAt: new Date().toISOString() 
            }] 
          })
        }
      },

      removeWord: (word) => {
        set({ 
          words: get().words.filter(w => w.word.toLowerCase() !== word.toLowerCase())
        })
      },

      getWord: (word) => {
        return get().words.find(w => w.word.toLowerCase() === word.toLowerCase())
      },

      clearWords: () => set({ words: [] })
    }),
    {
      name: 'voca-storage'
    }
  )
)

