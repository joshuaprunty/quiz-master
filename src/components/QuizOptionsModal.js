import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

export default function QuizOptionsModal({ isOpen, onClose, onSave, quiz }) {
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (quiz) {
      setIsPublic(quiz.public !== undefined ? quiz.public : true);
    }
    // Or handle resetting if needed
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
      // If user closes externally, reset state if needed
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