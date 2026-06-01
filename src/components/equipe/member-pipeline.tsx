import { ProspectsPipeline } from './prospects-pipeline'
import type { Prospect } from '@/lib/types'

interface MemberPipelineProps {
  prospects: Prospect[]
  memberId: string
  closers?: { id: string; full_name: string }[]
  tallyBaseUrl?: string | null
}

export function MemberPipeline({ prospects, memberId, closers, tallyBaseUrl }: MemberPipelineProps) {
  return <ProspectsPipeline prospects={prospects} memberId={memberId} closers={closers} tallyBaseUrl={tallyBaseUrl} />
}
