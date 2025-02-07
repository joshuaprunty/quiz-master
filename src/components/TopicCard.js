import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function TopicCard({ topic, index, onTopicToggle, onPriorityChange }) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{topic.topic}</h3>
          <p className="text-gray-600 mt-2">{topic.description}</p>
        </div>
        <Switch
          checked={topic.priority > 0}
          onCheckedChange={(checked) => onTopicToggle(index, checked)}
        />
      </div>
      
      {topic.priority > 0 && (
        <div className="space-y-2 w-3/5">
          <Label>Priority</Label>
          <Slider
            value={[topic.priority]}
            onValueChange={(value) => onPriorityChange(index, value[0])}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  );
}