import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function QuizConfigModal({ isOpen, onClose, onSave, enabledTopicCount }) {
  const [config, setConfig] = useState({
    'multiple-choice': 1,
    'true-false': 1,
    'short-answer': 1
  });

  const adjustCount = (type, increment) => {
    setConfig(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + increment)
    }));
  };

  const handleSave = () => {
    const total = Object.values(config).reduce((sum, count) => sum + count, 0);
    if (total === 0) {
      return;
    }
    onSave(config);
    onClose();
  };

  const totalQuestions = Object.values(config).reduce((sum, count) => sum + count, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Quiz Questions</DialogTitle>
          <DialogDescription>
            Set the number of each type of question for your quiz. Questions will be distributed across {enabledTopicCount} enabled topics based on their priority levels.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {Object.entries(config).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="capitalize">{type.replace('-', ' ')}</span>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => adjustCount(type, -1)}
                  disabled={count === 0}
                >
                  -
                </Button>
                <span className="w-8 text-center">{count}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => adjustCount(type, 1)}
                >
                  +
                </Button>
              </div>
            </div>
          ))}
          
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Total Questions: {totalQuestions}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={totalQuestions === 0}
          >
            Generate Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}