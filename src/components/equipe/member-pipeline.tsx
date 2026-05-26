import { ProspectsPipeline } from './prospects-pipeline'
import type { Prospect } from '@/lib/types'

interface MemberPipelineProps {
  prospects: Prospect[]
  memberId: string
}

export function MemberPipeline({ prospects, memberId }: MemberPipelineProps) {
  return <ProspectsPipeline prospects={prospects} memberId={memberId} />
}
