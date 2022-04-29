import type { Uri } from '../../types'

export type SuggestSubject = ({
  subject,
  sender,
}: {
  subject: Uri
  sender: Uri
}) => Promise<void>

export const suggestSubject: SuggestSubject = async ({ subject, sender }) => {
  return
}
