import type { z } from "zod";

import type {
  preConcealmentWorkflowSchema,
  workflowSchema,
  workflowStageSchema
} from "@/domain/schemas/workflow";

export type WorkflowStage = z.infer<typeof workflowStageSchema>;
export type Workflow = z.infer<typeof workflowSchema>;
export type PreConcealmentWorkflow = z.infer<
  typeof preConcealmentWorkflowSchema
>;
