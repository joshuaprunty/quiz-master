import { Label } from "@/components/ui/label";

export default function QuestionEditForm({
  question,
  index,
  editingCorrectAnswer,
  onEditChange,
  onCorrectAnswerSelection,
}) {
  if (question.type === 'short-answer') {
    return (
      <div className="space-y-2">
        <Label>Correct Answer</Label>
        <input
          type="text"
          value={editingCorrectAnswer || ''}
          onChange={(e) => onCorrectAnswerSelection(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Enter correct answer..."
        />
      </div>
    );
  }

  return (
    <div>
      {question.answers.map((answer, ansIndex) => (
        <div key={ansIndex} className="flex items-center space-x-2">
          <input
            type="text"
            value={answer}
            onChange={(e) =>
              onEditChange(
                index,
                `answers[${ansIndex}]`,
                e.target.value
              )
            }
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="checkbox"
            checked={editingCorrectAnswer === answer}
            onChange={() => onCorrectAnswerSelection(answer)}
            className="h-6 w-6 checked:border-blue-500"
          />
        </div>
      ))}
    </div>
  );
}