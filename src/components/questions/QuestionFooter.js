import { Button } from "@/components/ui/button";

export default function QuestionFooter({
  index,
  editingIndex,
  selectedAnswers,
  checkedAnswers,
  hasAttempted,
  explanationVisible,
  question,
  onSaveEdit,
  onCheckAnswer,
  onToggleExplanation,
}) {
  if (editingIndex === index) {
    return (
      <Button onClick={onSaveEdit} variant="save">
        Save
      </Button>
    );
  }

  return (
    <>
      <div className="flex flex-row items-center gap-4 justify-start w-full">
        <Button
          onClick={() => onCheckAnswer(index)}
          disabled={!selectedAnswers[index]}
          variant={checkedAnswers[index] ? "save" : "default"}
          className={checkedAnswers[index] ? "w-[100px]" : ""}
        >
          {checkedAnswers[index] ? "Correct!" : "Check Answer"}
        </Button>
        
        {selectedAnswers[index] && checkedAnswers[index] && (
          <Button
            onClick={() => onToggleExplanation(index)}
          >
            {explanationVisible[index] ? "Hide Explanation" : "View Explanation"}
          </Button>
        )}
        
        {selectedAnswers[index] && !checkedAnswers[index] && hasAttempted[index] && (
          <p className="text-red-600">
            Incorrect
          </p>
        )}
      </div>
      
      {explanationVisible[index] && (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg">
          <p>{question.explanation}</p>
        </div>
      )}
    </>
  );
}