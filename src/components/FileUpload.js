'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import SaveQuizModal from './SaveQuizModal';
import saveQuiz from '@/firebase/firestore/saveQuiz';
import { useAuthContext } from '@/context/AuthContext';

export default function TextInput() {
	const [studyText, setStudyText] = useState('');
	const [topics, setTopics] = useState(null);
	const [questions, setQuestions] = useState(null);
	const [loading, setLoading] = useState(false);
	const [selectedAnswers, setSelectedAnswers] = useState({});
	const [checkedAnswers, setCheckedAnswers] = useState({});
	const { user } = useAuthContext();
	const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const { toast } = useToast();

	const analyzeText = async () => {
		if (!studyText.trim()) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Please enter some text before analyzing.",
			});
			return;
		}
		
		setLoading(true);
		try {
			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text: studyText }),
			});

			if (!response.ok) throw new Error('Analysis failed');
			
			const rawData = await response.json();
			
			// Check if the response is an error message
			if (rawData.error) {
				throw new Error(rawData.error);
			}

			try {
				// Parse the response and access the 'topics' array
				const parsedData = JSON.parse(rawData);
				setTopics(parsedData.topics); // Access the 'topics' array from the parsed object
			} catch (parseError) {
				console.error('Error parsing JSON:', parseError);
				setTopics([{
					topic: 'Response',
					description: rawData
				}]);
			}
		} catch (error) {
			console.error('Error analyzing text:', error);
		} finally {
			setLoading(false);
		}
	};

	const generateQuestions = async () => {
		if (!studyText.trim()) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Please enter some text before generating questions.",
			});
			return;
		}
		
		setLoading(true);
		try {
			const response = await fetch('/api/questiongen', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text: studyText }),
			});

			if (!response.ok) throw new Error('Question generation failed');
			
			const data = await response.json();
			if (data.error) {
				throw new Error(data.error);
			}

			setQuestions(data);
			setSelectedAnswers({});
			setCheckedAnswers({});
		} catch (error) {
			console.error('Error generating questions:', error);
		} finally {
			setLoading(false);
		}
	};

	const checkAnswer = (questionIndex) => {
		const question = questions[questionIndex];
		const isCorrect = selectedAnswers[questionIndex] === question.correct_answer;
		setCheckedAnswers({
			...checkedAnswers,
			[questionIndex]: isCorrect
		});
	};

	const handleSaveQuiz = async (title) => {
		if (!user) {
			console.error('User not authenticated');
			return;
		}

		setIsSaving(true);
		try {
			const quizData = {
				title,
				questions,
				originalText: studyText
			};

			const { error } = await saveQuiz(user.uid, quizData);
			
			if (error) {
				console.error('Error saving quiz:', error);
				return;
			}

			setIsSaveModalOpen(false);
			// Optionally add a success notification here
		} catch (error) {
			console.error('Error saving quiz:', error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-4 my-12 max-w-4xl">
			<Textarea
				placeholder="Paste your study materials here..."
				className="min-h-[300px]"
				value={studyText}
				onChange={(e) => setStudyText(e.target.value)}
			/>
			
			<div className="flex gap-4">
				<Button 
					onClick={analyzeText} 
					className="flex-1"
					disabled={loading}
				>
					{loading ? 'Analyzing...' : 'Analyze Topics'}
				</Button>

				<Button 
					onClick={generateQuestions} 
					className="flex-1"
					disabled={loading}
				>
					{loading ? 'Generating...' : 'Generate Questions'}
				</Button>
			</div>

			{topics && (
				<div className="mt-8 space-y-4">
					<h2 className="text-xl font-bold">Main Topics Identified:</h2>
					<div className="grid gap-4">
						{topics.map((topic, index) => (
							<div key={index} className="border rounded-lg p-4">
								<h3 className="font-semibold">{topic.topic}</h3>
								<p className="text-gray-600 mt-2">{topic.description}</p>
							</div>
						))}
					</div>
				</div>
			)}

			{questions && (
				<div className="mt-8 space-y-4">
					<h2 className="text-xl font-bold">Practice Questions:</h2>
					<div className="grid gap-6">
						{questions.map((question, index) => (
							<Card key={index} className="w-full">
								<CardHeader>
									<h3 className="font-semibold text-lg">Question {index + 1}</h3>
									<p>{question.question}</p>
								</CardHeader>
								<CardContent>
									<RadioGroup
										value={selectedAnswers[index]}
										onValueChange={(value) => setSelectedAnswers({
											...selectedAnswers,
											[index]: value
										})}
									>
										{question.answers.map((answer, ansIndex) => (
											<div key={ansIndex} className="flex items-center space-x-2">
												<RadioGroupItem value={answer} id={`q${index}-a${ansIndex}`} />
												<Label htmlFor={`q${index}-a${ansIndex}`}>{answer}</Label>
											</div>
										))}
									</RadioGroup>
								</CardContent>
								<CardFooter className="flex justify-between items-center">
									<Button 
										onClick={() => checkAnswer(index)}
										disabled={!selectedAnswers[index]}
									>
										Check Answer
									</Button>
									{checkedAnswers[index] !== undefined && (
										<p className={checkedAnswers[index] ? "text-green-600" : "text-red-600"}>
											{checkedAnswers[index] ? "Correct!" : "Incorrect"}
										</p>
									)}
								</CardFooter>
							</Card>
						))}
					</div>
					<Button 
						onClick={() => setIsSaveModalOpen(true)}
						className="mt-4"
					>
						Save Quiz
					</Button>
				</div>
			)}

			<SaveQuizModal
				isOpen={isSaveModalOpen}
				onClose={() => setIsSaveModalOpen(false)}
				onSave={handleSaveQuiz}
				loading={isSaving}
			/>
			<Toaster />
		</div>
	);
}






// 'use client';

// import Uppy from '@uppy/core';
// import Dashboard from '@uppy/react/lib/Dashboard';
// import Tus from '@uppy/tus';
// import { useState } from 'react';

// import '@uppy/core/dist/style.min.css';
// import '@uppy/dashboard/dist/style.min.css';

// function createUppy() {
// 	return new Uppy().use(Tus, { endpoint: '/api/upload' });
// }

// export default function FileUpload() {
// 	const [uppy] = useState(createUppy);
// 	return <Dashboard theme="light" uppy={uppy} />;
// }