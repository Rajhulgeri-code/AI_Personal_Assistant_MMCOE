import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { NLPCommand } from '../types';
import { Send, MessageSquare, Check, X, Loader2, History } from 'lucide-react';
import { Separator } from './ui/separator';

interface NLPCommandInterfaceProps {
  onCommandSubmit: (command: string) => Promise<NLPCommand>;
  onCommandAccept: (commandId: string) => void;
  onCommandReject: (commandId: string) => void;
  auditLog?: Array<{ action: string; details: string; timestamp: string }>;
}

export function NLPCommandInterface({
  onCommandSubmit,
  onCommandAccept,
  onCommandReject,
  auditLog = [],
}: NLPCommandInterfaceProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<NLPCommand | null>(null);
  const [commandHistory, setCommandHistory] = useState<NLPCommand[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const parsedCommand = await onCommandSubmit(input);
      setCurrentCommand(parsedCommand);
      setCommandHistory(prev => [parsedCommand, ...prev].slice(0, 10));
      setInput('');
    } catch (error) {
      console.error('Error processing command:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = () => {
    if (!currentCommand) return;
    onCommandAccept(currentCommand.id);
    setCurrentCommand(null);
  };

  const handleReject = () => {
    if (!currentCommand) return;
    onCommandReject(currentCommand.id);
    setCurrentCommand(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-amber-600';
    return 'text-red-600';
  };

  const examples = [
    "Reschedule John's appointment to Thursday evening",
    "Mark Priya as urgent",
    "Find patients with postponed lab results",
    "Cancel all appointments for tomorrow morning",
    "Add follow-up for Emma Williams next week",
  ];

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle>AI Command Interface</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Type natural language commands to manage schedules and patients
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Command Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Reschedule John's appointment to Thursday..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button type="submit" disabled={isProcessing || !input.trim()}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {/* Example Commands */}
          {!currentCommand && commandHistory.length === 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm mb-2">Try these commands:</p>
              <div className="space-y-1">
                {examples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(example)}
                    className="block w-full text-left text-sm text-muted-foreground hover:text-foreground p-2 rounded hover:bg-muted transition-colors"
                  >
                    • {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Command Preview */}
          {currentCommand && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm mb-1">You said:</p>
                    <p className="italic text-sm">&ldquo;{currentCommand.input}&rdquo;</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm">AI interpreted this as:</p>
                      <Badge variant="outline" className={getConfidenceColor(currentCommand.parsed.confidence)}>
                        {Math.round(currentCommand.parsed.confidence * 100)}% confident
                      </Badge>
                    </div>
                    <div className="bg-white p-3 rounded text-sm">
                      <p className="mb-2">
                        <span className="text-muted-foreground">Action:</span>{' '}
                        <span className="capitalize">{currentCommand.parsed.action.replace(/_/g, ' ')}</span>
                      </p>
                      {Object.entries(currentCommand.parsed.entities).length > 0 && (
                        <div className="space-y-1">
                          {Object.entries(currentCommand.parsed.entities).map(([key, value]) => (
                            <p key={key}>
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>{' '}
                              <span>{String(value)}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {currentCommand.preview && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm mb-1">This will:</p>
                        <p className="text-sm">{currentCommand.preview}</p>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleAccept} className="flex-1">
                      <Check className="h-4 w-4 mr-1" />
                      Accept & Execute
                    </Button>
                    <Button onClick={handleReject} variant="outline" className="flex-1">
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Command History */}
          {commandHistory.length > 0 && !currentCommand && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm">Recent Commands</h3>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {commandHistory.map(cmd => (
                    <div key={cmd.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm flex-1">&ldquo;{cmd.input}&rdquo;</p>
                        <Badge
                          variant={
                            cmd.status === 'accepted'
                              ? 'default'
                              : cmd.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="ml-2"
                        >
                          {cmd.status}
                        </Badge>
                      </div>
                      {cmd.preview && (
                        <p className="text-xs text-muted-foreground">{cmd.preview}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(cmd.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Audit Log */}
          {auditLog.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm mb-3">Audit Log</h3>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {auditLog.map((entry, idx) => (
                      <div key={idx} className="p-2 bg-muted/50 rounded text-xs">
                        <p>{entry.details}</p>
                        <p className="text-muted-foreground mt-1">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
