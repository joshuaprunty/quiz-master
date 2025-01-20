'use client';

import Uppy from '@uppy/core';
import Dashboard from '@uppy/react/lib/Dashboard';
import Tus from '@uppy/tus';
import { useState } from 'react';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

function createUppy() {
	return new Uppy().use(Tus, { endpoint: '/api/upload' });
}

export default function FileUpload() {
	const [uppy] = useState(createUppy);
	return <Dashboard theme="light" uppy={uppy} />;
}