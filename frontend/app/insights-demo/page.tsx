'use client';

import { InsightsPanel } from '@/components/insights-panel';

export default function InsightsDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Conversation Insights Demo</h1>
          <p className="text-muted-foreground">
            This demo shows the insights panel with mock data. The insights calculate:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
            <li><strong>Days Since Reply:</strong> How long since the user last responded</li>
            <li><strong>Response Rate:</strong> Percentage of messages the user responds to</li>
            <li><strong>Dryness Score:</strong> Average word count per message (lower = drier)</li>
            <li><strong>Ghost Score:</strong> Overall risk of being ghosted (0-100)</li>
          </ul>
        </div>
        
        <InsightsPanel 
          conversationId="demo-conversation" 
          className="w-full"
        />
      </div>
    </div>
  );
}
