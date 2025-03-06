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
  onOpenChange,  // parent sets this: (open) => setDeleteModalOpen(open)
  onConfirm,
  loading,
  quizTitle,
}) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // If user clicks outside or presses Esc, close the modal in parent
        if (!open) onOpenChange(false);
      }}
    >
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
            onClick={() => onOpenChange(false)} // closes modal
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm} // your confirm logic
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}