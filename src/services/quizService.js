export async function analyzeText(text) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) throw new Error("Analysis failed");
  return response.json();
}

export async function generateQuestions(text, config, topics) {
  const response = await fetch("/api/questiongen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, config, topics }),
  });

  if (!response.ok) throw new Error("Question generation failed");
  return response.json();
}