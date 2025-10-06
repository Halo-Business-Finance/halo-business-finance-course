import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DragDropContainerProps {
  element: any;
  onScore: (score: number) => void;
}

export const DragDropContainer = ({ element, onScore }: DragDropContainerProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropZones, setDropZones] = useState<{ [key: string]: string[] }>({
    'high-priority': [],
    'medium-priority': [],
    'low-priority': []
  });
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const documents = [
    { id: 'business-plan', name: 'Business Plan', correctZone: 'high-priority' },
    { id: 'financial-statements', name: 'Financial Statements', correctZone: 'high-priority' },
    { id: 'tax-returns', name: 'Tax Returns', correctZone: 'high-priority' },
    { id: 'bank-statements', name: 'Bank Statements', correctZone: 'medium-priority' },
    { id: 'collateral-info', name: 'Collateral Information', correctZone: 'medium-priority' },
    { id: 'insurance-docs', name: 'Insurance Documents', correctZone: 'low-priority' },
    { id: 'lease-agreements', name: 'Lease Agreements', correctZone: 'low-priority' }
  ];

  const availableItems = documents.filter(doc => 
    !Object.values(dropZones).flat().includes(doc.id)
  );

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    
    if (draggedItem) {
      // Remove item from other zones
      const newDropZones = { ...dropZones };
      Object.keys(newDropZones).forEach(zone => {
        newDropZones[zone] = newDropZones[zone].filter(item => item !== draggedItem);
      });
      
      // Add to new zone
      newDropZones[zoneId] = [...newDropZones[zoneId], draggedItem];
      setDropZones(newDropZones);
      setDraggedItem(null);
    }
  };

  const handleSubmit = () => {
    let correctPlacements = 0;
    let totalPlacements = 0;

    documents.forEach(doc => {
      Object.entries(dropZones).forEach(([zone, items]) => {
        if (items.includes(doc.id)) {
          totalPlacements++;
          if (zone === doc.correctZone) {
            correctPlacements++;
          }
        }
      });
    });

    const calculatedScore = totalPlacements > 0 ? (correctPlacements / totalPlacements) * 100 : 0;
    setScore(Math.round(calculatedScore));
    setIsComplete(true);
    onScore(calculatedScore);

    toast({
      title: calculatedScore >= 70 ? "Great job!" : "Keep trying!",
      description: `You got ${correctPlacements} out of ${totalPlacements} correct (${Math.round(calculatedScore)}%)`,
      variant: calculatedScore >= 70 ? "default" : "destructive"
    });
  };

  const handleReset = () => {
    setDropZones({
      'high-priority': [],
      'medium-priority': [],
      'low-priority': []
    });
    setIsComplete(false);
    setScore(0);
  };

  const getZoneColor = (zoneId: string) => {
    switch (zoneId) {
      case 'high-priority': return 'border-red-200 bg-red-50';
      case 'medium-priority': return 'border-yellow-200 bg-yellow-50';
      case 'low-priority': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getZoneTitle = (zoneId: string) => {
    switch (zoneId) {
      case 'high-priority': return 'High Priority';
      case 'medium-priority': return 'Medium Priority';
      case 'low-priority': return 'Low Priority';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{element.title}</h3>
        <p className="text-muted-foreground">{element.description}</p>
      </div>

      {/* Available Items */}
      <Card>
        <CardHeader>
          <CardTitle>Available Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {availableItems.map(item => (
              <div
                key={item.id}
                draggable={!isComplete}
                onDragStart={(e) => handleDragStart(e, item.id)}
                className={`
                  p-3 bg-white border rounded-lg shadow-sm cursor-move
                  hover:shadow-md transition-shadow select-none
                  ${isComplete ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {item.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drop Zones */}
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(dropZones).map(([zoneId, items]) => (
          <Card key={zoneId} className={getZoneColor(zoneId)}>
            <CardHeader>
              <CardTitle className="text-lg">{getZoneTitle(zoneId)}</CardTitle>
            </CardHeader>
            <CardContent
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, zoneId)}
              className="min-h-[200px] space-y-2"
            >
              {items.map(itemId => {
                const document = documents.find(doc => doc.id === itemId);
                const isCorrect = isComplete && document?.correctZone === zoneId;
                const isIncorrect = isComplete && document?.correctZone !== zoneId;
                
                return (
                  <div
                    key={itemId}
                    className={`
                      p-2 bg-white border rounded shadow-sm flex items-center justify-between
                      ${isCorrect ? 'border-green-500 bg-green-50' : ''}
                      ${isIncorrect ? 'border-red-500 bg-red-50' : ''}
                    `}
                  >
                    <span className="text-sm">{document?.name}</span>
                    {isComplete && (
                      isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )
                    )}
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-gray-300 rounded">
                  Drop documents here
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete && (
            <span className={`text-sm font-medium ${score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
              Score: {score}%
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isComplete || Object.values(dropZones).flat().length === 0}
          >
            {isComplete ? 'Completed' : 'Submit'}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> Drag and drop the documents into the appropriate priority categories 
            based on their importance for SBA Express loan applications. High priority documents are essential, 
            medium priority are important but not critical, and low priority are supporting documents.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};