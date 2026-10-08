import { createContext, useContext } from 'react'
import type { FeedbackTopicId } from '../../data/content'

export interface OpenFeedbackOptions {
  /** Topic chip to preselect. */
  topic?: FeedbackTopicId
  /** Element to focus when the dialog closes (defaults to the element focused at open time). */
  returnFocus?: HTMLElement | null
}

export interface FeedbackContextValue {
  openFeedback: (options?: OpenFeedbackOptions) => void
}

export const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback must be used inside <FeedbackProvider>')
  return ctx
}
