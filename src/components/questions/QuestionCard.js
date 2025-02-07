import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsThreeDots } from 'react-icons/bs';
import { RiSparkling2Fill } from "react-icons/ri";
import { FaRegTrashAlt, FaRegEdit } from "react-icons/fa";
import QuestionActions from "@/components/questions/QuestionActions";
import QuestionAnswerForm from "@/components/questions/QuestionAnswerForm";
import QuestionEditForm from "@/components/questions/QuestionEditForm";
import QuestionFooter from "@/components/questions/QuestionFooter";

export default function QuestionCard({
  question,
  index,
  editingIndex,
  editingCorrectAnswer,
  selectedAnswers,
  checkedAnswers,
  explanationVisible,
  pendingRegeneration,
  loadingStates,
  hasAttempted,
  onEditClick,
  onEditChange,
  onCorrectAnswerSelection,
  onSaveEdit,
  onRegenerateQuestion,
  onAcceptRegeneration,
  onRevertRegeneration,
  onDeleteQuestion,
  onAnswerSelect,
  onCheckAnswer,
  onToggleExplanation,
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-row justify-between items-start">
          <h3 className="font-semibold text-lg">
            {index + 1}. {question.question}
          </h3>
          {/* Question Actions */}
          {pendingRegeneration[index] ? (
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => onAcceptRegeneration(index)}
                variant="save"
                className="w-[100px]"
              >
                Keep New
              </Button>
              <Button
                onClick={() => onRevertRegeneration(index)}
                variant="outline"
                className="w-[100px]"
              >
                Revert
              </Button>
            </div>
          ) : (
            <QuestionActions
              index={index}
              loadingStates={loadingStates}
              onRegenerateQuestion={onRegenerateQuestion}
              onEditClick={onEditClick}
              onDeleteQuestion={onDeleteQuestion}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editingIndex === index ? (
          <QuestionEditForm
            question={question}
            index={index}
            editingCorrectAnswer={editingCorrectAnswer}
            onEditChange={onEditChange}
            onCorrectAnswerSelection={onCorrectAnswerSelection}
          />
        ) : (
          <QuestionAnswerForm
            question={question}
            index={index}
            selectedAnswers={selectedAnswers}
            onAnswerSelect={onAnswerSelect}
          />
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <QuestionFooter
          index={index}
          editingIndex={editingIndex}
          selectedAnswers={selectedAnswers}
          checkedAnswers={checkedAnswers}
          hasAttempted={hasAttempted}
          explanationVisible={explanationVisible}
          question={question}
          onSaveEdit={onSaveEdit}
          onCheckAnswer={onCheckAnswer}
          onToggleExplanation={onToggleExplanation}
        />
      </CardFooter>
    </Card>
  );
}