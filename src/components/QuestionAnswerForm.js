import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function QuestionAnswerForm({
  question,
  index,
  selectedAnswers,
  onAnswerSelect,
}) {
  if (question.type === 'short-answer') {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={selectedAnswers[index] || ''}
          onChange={(e) => onAnswerSelect(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Type your answer here..."
        />
      </div>
    );
  }

  return (
    <RadioGroup
      value={selectedAnswers[index]}
      onValueChange={onAnswerSelect}
    >
      {question.answers.map((answer, ansIndex) => (
        <div
          key={ansIndex}
          className="flex items-center space-x-2"
        >
          <RadioGroupItem
            value={answer}
            id={`q${index}-a${ansIndex}`}
          />
          <Label htmlFor={`q${index}-a${ansIndex}`}>
            {answer}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}