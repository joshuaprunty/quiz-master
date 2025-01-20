'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function TextInput() {
	const [studyText, setStudyText] = useState('');
	const [topics, setTopics] = useState(null);
	const [loading, setLoading] = useState(false);

	const analyzeText = async () => {
		if (!studyText.trim()) return;
		
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

	return (
		<div className="space-y-4 max-w-4xl mx-auto">
			<Textarea
				placeholder="Paste your study materials here..."
				className="min-h-[300px]"
				value={studyText}
				onChange={(e) => setStudyText(e.target.value)}
			/>
			
			<Button 
				onClick={analyzeText} 
				className="w-full"
				disabled={loading}
			>
				{loading ? 'Analyzing...' : 'Analyze Text'}
			</Button>

			{/* <Button onClick={() => console.log(topics)}>log topics</Button> */}

			{/* {topics && (
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
			)} */}

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