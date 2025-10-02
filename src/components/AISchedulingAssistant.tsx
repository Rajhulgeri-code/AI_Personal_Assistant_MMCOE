import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { AIScheduleSuggestion, ScheduleConflict } from '../types';
import { Sparkles, Check, X, Edit, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface AISchedulingAssistantProps {
  suggestions: AIScheduleSuggestion[];
  conflicts: ScheduleConflict[];
  onAcceptSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
  onEditSuggestion: (id: string) => void;
}

export function AISchedulingAssistant({
  suggestions,
  conflicts,
  onAcceptSuggestion,
  onRejectSuggestion,
  onEditSuggestion,
}: AISchedulingAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);

  const priorityColors = {
    emergency: 'bg-red-500',
    urgent: 'bg-amber-500',
    normal: 'bg-green-500',
  };

  const conflictSeverityColors = {
    high: 'border-red-500 bg-red-50',
    medium: 'border-amber-500 bg-amber-50',
    low: 'border-blue-500 bg-blue-50',
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>AI Scheduling Assistant</CardTitle>
                {suggestions.length > 0 && (
                  <Badge variant="secondary">{suggestions.length} suggestions</Badge>
                )}
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {/* Conflicts Section */}
              {conflicts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm">Schedule Conflicts</h3>
                  </div>
                  <div className="space-y-2">
                    {conflicts.map(conflict => (
                      <Alert
                        key={conflict.id}
                        className={`border-l-4 ${conflictSeverityColors[conflict.severity]}`}
                      >
                        <AlertDescription>
                          <p className="mb-2">{conflict.description}</p>
                          {conflict.suggestedResolution && (
                            <p className="text-sm text-muted-foreground">
                              💡 {conflict.suggestedResolution}
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions Section */}
              <div>
                <h3 className="text-sm mb-3">AI Recommendations</h3>
                <div className="space-y-3">
                  {suggestions.map(suggestion => (
                    <Card key={suggestion.id} className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p>{suggestion.patientName}</p>
                              <Badge className={priorityColors[suggestion.priority]}>
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(suggestion.suggestedDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              at {suggestion.suggestedStartTime}
                            </p>
                          </div>
                          <div className="text-sm">
                            <span className={getConfidenceColor(suggestion.confidence)}>
                              {Math.round(suggestion.confidence * 100)}% confident
                            </span>
                          </div>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg mb-3">
                          <p className="text-sm">{suggestion.reason}</p>
                        </div>

                        {suggestion.conflicts && suggestion.conflicts.length > 0 && (
                          <Alert className="mb-3 bg-amber-50 border-amber-200">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-sm">
                              <p>Potential conflicts:</p>
                              <ul className="list-disc list-inside mt-1">
                                {suggestion.conflicts.map((conflict, idx) => (
                                  <li key={idx}>{conflict}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onAcceptSuggestion(suggestion.id)}
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditSuggestion(suggestion.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRejectSuggestion(suggestion.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {suggestions.length === 0 && conflicts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No AI suggestions at the moment.</p>
                      <p className="text-sm">The AI is monitoring your schedule continuously.</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
