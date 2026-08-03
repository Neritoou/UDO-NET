'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@module_1/auth/exports'
import { updateContentVisibility, updateReportsStatus } from '@module_5/reports/exports'
import type { TargetType } from '@/lib/types/report'

export async function moderateReportAction(
  target_id: string,
  target_type: TargetType,
  action: 'approve' | 'reject'
) {
  const moderator = await getCurrentUser()
  if (!moderator) throw new Error('No autenticado.')
  if (!['moderator', 'admin'].includes(moderator.role)) throw new Error('No autorizado.')

  if (action === 'approve') {
    await updateContentVisibility(target_id, target_type, moderator)
  } else {
    await updateReportsStatus(target_id, target_type, moderator)
  }

  revalidatePath('/')
  revalidatePath('/moderation')
}