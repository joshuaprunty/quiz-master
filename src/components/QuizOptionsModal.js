import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function QuizOptionsModal({ isOpen, onClose, onSave, quiz }) {
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (quiz) {
      setIsPublic(quiz.public !== undefined ? quiz.public : true);
    }
    // Reset state when modal closes
    if (!isOpen) {
      setIsPublic(true);
    }
  }, [quiz, isOpen]);

  const handleSave = () => {
    onSave({ public: isPublic });
    onClose();
  };

  const handleOpenChange = (open) => {
    if (!open) {
      // Reset state when modal closes via escape key or clicking outside
      setIsPublic(true);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quiz Options</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="public-toggle">Make quiz public</Label>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}