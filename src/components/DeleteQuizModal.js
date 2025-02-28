import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function DeleteQuizModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  quizTitle,
}) {
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Quiz</DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-4">
          Are you sure you want to delete "{quizTitle}"? This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}