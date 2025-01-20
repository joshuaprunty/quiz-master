import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteQuizModal({ isOpen, onClose, onConfirm, loading, quizTitle }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Quiz</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete "{quizTitle}"? This action cannot be undone.</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Quiz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}